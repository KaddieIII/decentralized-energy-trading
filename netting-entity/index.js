const express = require("express");
const cors = require("cors");
const commander = require("commander");
const web3Utils = require("web3-utils");
const shell = require("shelljs");
const fs = require("fs");
const Utility = require("./utility");
const hhHandler = require("./household-handler");
const zkHandler = require("./zk-handler");
const web3Helper = require("../helpers/web3");
const contractHelper = require("../helpers/contract");


const ewo = require('./sendReq');
var awhandler = require("./apis/awattar_handler");
var cryptohandler = require("./apis/cryptoCurrHandler");
var currencyConverter = require("./apis/currency_converter");

const serverConfig = require("../ned-server-config");
const householdConfig = require("../household-server-config");
const db_helper = require("../connectToEWO/originDatabase/index");

// Specify cli options
commander
  .option("-h, --host <type>", "ip of ned server")
  .option("-p, --port <type>", "port of ned server")
  .option("-i, --interval <type>", "interval of the netting")
  .option(
    "-n, --network <type>",
    "network name specified in truffle-config.js"
  );
commander.parse(process.argv);

const config = {
  nettingInterval: commander.interval || serverConfig.nettingInterval,
  host: commander.host || serverConfig.host,
  port: commander.port || serverConfig.port,
  network: commander.network || serverConfig.network,
  address: serverConfig.address,
  password: serverConfig.password
};

let web3;
/** @type Utility */
let utility;
/** @type Utility */
let utilityAfterNetting;
let ownedSetContract;
let utilityContract;
let latestBlockNumber;

async function init() {
  web3 = web3Helper.initWeb3(config.network);
  latestBlockNumber = await web3.eth.getBlockNumber();
  // Off-chain utility instance
  utility = new Utility();
  utilityContract = new web3.eth.Contract(
    contractHelper.getAbi("dUtility"),
    contractHelper.getDeployedAddress("dUtility", await web3.eth.net.getId())
  );
  ownedSetContract = new web3.eth.Contract(
    contractHelper.getAbi("ownedSet"),
    contractHelper.getDeployedAddress("ownedSet", await web3.eth.net.getId())
  );
  shell.cd("zokrates-code");

  utilityContract.events.NettingSuccess(
    {
      fromBlock: latestBlockNumber
    },
    async (error, event) => {
      if (error) {
        console.error(error.msg);
        throw error;
      }
      console.log("Netting Successful!");
      latestBlockNumber = event.blockNumber;
      utility = utilityAfterNetting;
    }
  );
  
  // returns the Saldo of the community
  async function checkSaldo(){
    let utility2 = utility;
    let utilityBeforeNetting = JSON.parse(JSON.stringify(utility2)); // dirty hack for obtaining deep copy of utility
    Object.setPrototypeOf(utilityBeforeNetting, Utility.prototype);
    utilityAfterNetting = { ...utility2 };
    Object.setPrototypeOf(utilityAfterNetting, Utility.prototype);
    utilityAfterNetting.settle();
    let saldo = 0;
    for (i in utilityAfterNetting.households){
      saldo += utilityAfterNetting.households[i].meterDelta
    }
    console.log("Community-Saldo: " + saldo);
    if(saldo > 0){
      //avg marketprice
      async function getAVGasks() {
        asks = await Promise.resolve(db_helper.readAsks); // readBids
        //return asks;
        return [avgasks/100 , avgbids/100]; //in USD
      }
      /*
      async function getAVGasks(){
        avgasks = await Promise.resolve(ewo.getAsks);
        //avgbids = await Promise.resolve(ewo.getBids);
        return [avgasks/100 , avgbids/100]; //in USD
      }
      */
      // avg stock exchange price
      async function priceCompare(){
        price = await Promise.resolve(awhandler.getMarketPrice); // aktueller Marktwert 1MWh in EUR (EPEX-Spotbörse)
        price_stock = price.data[0].marketprice;
        ewtPrice = await Promise.resolve(cryptohandler.getEWTvalue); // gibt den aktuellen Marktwert von EWT in Dollar wieder
        ewtChangeRate = ewtPrice.percent_change_30d;
        ratio_curr = await Promise.resolve(currencyConverter.getRatio); // rechnet Dollar in Euro um (aktueller Kurs)
        ewtPrice_eur = ewtPrice.price/ratio_curr.rates.USD; // Marktwert EWT in EUR
        
        avgmarketprice = await Promise.resolve(getAVGasks());
        //avgbids = avgmarketprice[1];  // avg bid-price in EWO marketplace in USD from past x minutes
        //avgbids_eur = avgbids/ratio_curr.rates.USD;
        avgasks = avgmarketprice[0];  // avg bid-price in EWO marketplace in USD
        avgasks_eur = avgasks/ratio_curr.rates.USD; // in EUR
        
        
        var buy;

        if (avgasks_eur < 0){
          pricecompare = 'Origin Marketplace: There is no data for the selected product and timespace.'
          console.log(pricecompare);
          buy = false;
        }else{
          pricecompare = ['Eine MWh kostet an der Boerse zur Zeit: ' + price_stock.toString() + ' EUR', 'Ein EWT kostet zur Zeit: ' + ewtPrice.price + ' USD bzw. ' + (ewtPrice_eur).toString()+' EUR', 'Somit ist der Wert von 1 EWT in den letzten 30 Tagen um ' + ewtChangeRate + '% gestiegen.', 'Der aktuelle Marktwert einer MWh in den Asks von EWO liegt bei ' + avgasks + ' USD, bzw. ' + avgasks_eur + ' EUR.'];
          console.log(pricecompare);
          if (price_stock < avgasks_eur){
            buy = true;
            console.log("Sie sollten über EWO verkaufen! So könnten Sie eine Preissteigerung von " + (Math.round((avgasks_eur-price_stock) * 100) / 100).toFixed(2) + ' EUR pro MWh erwarten');
          }else{
            buy = false;
            console.log("Sie sollten nicht über EWO verkaufen! Sie müssten mit einem Verlust von " + (Math.round((price_stock-avgasks_eur) * 100) / 100).toFixed(2) + ' EUR pro MWh rechnen');
          }
        }
        return buy;
      }

      priceCompare().then(buy => {
        if (buy === true){
          console.log("contact HPU");
        }
      });
    }
  }

  setTimeout(() => {
    checkSaldo();
  }, config.nettingInterval);
  
/*
  var pricecompare = marketplacePrice
  .then(result => {
    //ich habe den Durchschnittspreis. Was machen wir damit?
  })
  .then(newResult => somethingElse(newResult))
  .then(finalResult => {
    console.log(finalResult);
  })
  .catch(() => console.error('Nothing happened'));
*/


  async function runZokrates() {
    let utilityBeforeNetting = JSON.parse(JSON.stringify(utility)); // dirty hack for obtaining deep copy of utility
    Object.setPrototypeOf(utilityBeforeNetting, Utility.prototype);
    utilityAfterNetting = { ...utility };
    Object.setPrototypeOf(utilityAfterNetting, Utility.prototype);
    utilityAfterNetting.settle();
    /*
    let saldo = 0;
    for (i in utilityAfterNetting.households){
      saldo += utilityAfterNetting.households[i].meterDelta
    }
    console.log("Community-Saldo: " + saldo);
    */
    console.log("Utility before Netting: ", utilityBeforeNetting)
    console.log("Utility after Netting: ", utilityAfterNetting)
    let hhAddresses = zkHandler.generateProof(
      utilityBeforeNetting,
      utilityAfterNetting,
      "production_mode"
    );

    let rawdata = fs.readFileSync("../zokrates-code/proof.json");
    let data = JSON.parse(rawdata);
    if (hhAddresses.length > 0) {
      await web3.eth.personal.unlockAccount(
        config.address,
        config.password,
        null
      );
      utilityContract.methods
        .checkNetting(
          hhAddresses,
          data.proof.a,
          data.proof.b,
          data.proof.c,
          data.inputs
        )
        .send({ from: config.address, gas: 60000000 }, (error, txHash) => {
          if (error) {
            console.error(error.message);
            throw error;
          }
          console.log(`Sleep for ${config.nettingInterval}ms ...`);
          setTimeout(() => {
            runZokrates();
          }, config.nettingInterval);
        });
    } else {
      console.log("No households to hash.");
      console.log(`Sleep for ${config.nettingInterval}ms ...`);
      setTimeout(() => {
        runZokrates();
      }, config.nettingInterval);
    }
  }

  setTimeout(() => {
    runZokrates();
  }, config.nettingInterval);
}

init();

const app = express();

app.use(express.json());
app.use(cors());

/**
 * PUT /energy/:householdAddress
 */
app.put("/energy/:householdAddress", async (req, res) => {
  try {
    const householdAddress = web3Utils.toChecksumAddress(
      req.params.householdAddress
    );
    const { signature, hash, timestamp, meterDelta } = req.body;

    if (typeof meterDelta !== "number") {
      throw new Error("Invalid payload: meterDelta is not a number");
    }

    const validHouseholdAddress = await hhHandler.isValidatorAddress(
      ownedSetContract,
      householdAddress
    );
    if (!validHouseholdAddress) {
      throw new Error("Given address is not a validator");
    }

    const recoveredAddress = await web3Helper.verifySignature(
      web3,
      hash,
      signature
    );
    if (recoveredAddress != householdAddress) {
      throw new Error("Invalid signature");
    }

    if (utility.addHousehold(householdAddress)) {
      console.log(`New household ${householdAddress} added`);
    }
    console.log(
      `Incoming meter delta ${meterDelta} at ${timestamp} for ${householdAddress}`
    );
    utility.updateMeterDelta(householdAddress, meterDelta, timestamp);

    remoteAddress = req.socket.remoteAddress
    remotePort = req.socket.remotePort
    localAddress = req.socket.localAddress
    localPort = req.socket.localPort
    console.log('remote: ' + remoteAddress + ':' + remotePort);
    console.log('local: ' + localAddress + ':' + localPort);

    res.status(200).send();
    //res.sendStatus();
  } catch (err) {
    console.error("PUT /energy/:householdAddress", err.message);
    //res.status(400);
    //res.sendStatus(err);
    res.status(400).send(err);
  }
});

/**
 * GET endpoint returning the current energy balance of renewableEnergy from Utility.js
 */
app.get("/network", (req, res) => {
  try {
    res.status(200);
    res.json({
      renewableEnergy: utility.renewableEnergy,
      nonRenewableEnergy: utility.nonRenewableEnergy
    });
  } catch (err) {
    console.error("GET /network", err.message);
    res.status(400);
    res.send(err);
    //res.status(400).send(err);
  }
});

/**
 * GET endpoint returning the current meterDelta of a household that provides a valid signature for the account
 */
app.get("/meterdelta", async (req, res) => {
  try {
    const { signature, hash } = req.query;
    const recoveredAddress = await web3Helper.verifySignature(web3, hash, signature)
    const validHouseholdAddress = await hhHandler.isValidatorAddress(
      ownedSetContract,
      recoveredAddress
    );
    if (!validHouseholdAddress) {
      throw new Error("Given address is not a validator");
    }

    res.status(200);
    res.json({meterDelta: utility.households[recoveredAddress].meterDelta });
  } catch (err) {
    console.error("GET /meterdelta", err.message);
    res.status(400);
    res.send(err);
    // res.status(400).send(err);
  }
});

/**
 * GET endpoint returning the transfers of a specific Household and a given day from Utility.js
 * Access this like: http://127.0.0.1:3005/transfers/123456789?from=1122465557 (= Date.now())
 */
app.get("/transfers/:householdAddress", (req, res) => {
  try {
    const { from = 0 } = req.query;
    const householdAddress = web3Utils.toChecksumAddress(
      req.params.householdAddress
    );
    const transfers = utility.getTransfers(householdAddress, from);
    res.status(200);
    res.json(transfers || []);
  } catch (err) {
    console.error("GET /transfers/:householdAddress", err.message);
    res.status(400);
    res.send(err);
    // res.status(400).send(err);
  }
});

/**
 * GET request not supported
 */
app.get("/", function(req, res, next) {
  res.status(400);
  res.end(req.method + " is not supported.\n");
});

/**
 * POST request not supported
 */
app.post("/", function(req, res, next) {
  res.status(400);
  res.end(req.method + " is not supported.\n");
});

/**
 * DELETE request not supported
 */
app.delete("/", function(req, res, next) {
  res.status(400);
  res.end(req.method + " is not supported.\n");
});

/**
 * Let the server listen to incoming requests on the given IP:Port
 */
app.listen(config.port, () => {
  console.log(`Netting Entity running at http://${config.host}:${config.port}/`);
});
