const { Pool } = require('pg')
var fs = require('fs');
const config = require('../../db_config');
var awhandler = require("./awattar_handler");
var currencyConverter = require("./currency_converter");

const pool = new Pool({
  user: config.user,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port,
})
pool.connect()

/* get asset-Ids from database */
async function selectAssets() {
  try {
    let res;
    res = await pool.query(
        'SELECT id FROM public."exchange_asset"' // collect existing asset-Ids to generate new orders.
    );
    return res.rows;
  } catch (err) {
    return (err.stack);
  }
}

/* get User-Ids from database*/
async function selectUserId() {
    try {
      let res;
      res = await pool.query(
          'SELECT id FROM public."user"' // collect existing user-Ids to generate new orders.
      );
      return res.rows;
    } catch (err) {
      return (err.stack);
    }
}

async function randAssetId(){
    assets = await Promise.resolve(selectAssets());
    var count = 0;
    // count how many assets we have
    for (i in assets){
        count ++;
    }
    // pick random asset
    x = (Math.floor(Math.random()*(count)));
    return assets[x].id;
}

//randAssetId().then(console.log);

async function randUserId(){
    users = await Promise.resolve(selectUserId());
    var count = 0;
    // count how many users we have
    for (i in users){
        count ++;
    }
    // pick random user
    x = (Math.floor(Math.random()*(count)));
    return users[x].id;
}

//randUserId().then(console.log);

async function randStartVolume(){
    // pick random Bigint
    // value in Wh. A maximum of 1000MWh should be realistic.
    startV = (Math.floor(Math.random()*1000000000));
    return startV;
}

async function randCurrentVolume(){
    var startV = await Promise.resolve(randStartVolume());
    // pick random Bigint
    currV = (Math.floor(Math.random()*startV));
    return [startV, currV];
}

//randCurrentVolume().then(console.log);

// collect all (random) values
async function generateRandomEntries(){
    userId = await Promise.resolve(randUserId());

    volume = await Promise.resolve(randCurrentVolume())
    startV = volume[0];
    currV = volume[1];

    price_stock = await Promise.resolve(awhandler.getMarketPrice); // aktueller Marktwert 1MWh in EUR (EPEX-Spotbörse)
    console.log("Current MWh value from awattar: " + price_stock.data[0].marketprice + ' EUR', '\n');
    ratio_curr = await Promise.resolve(currencyConverter.getRatio); // Umrechnungskurs EUR USD
    console.log("Current exchange rate between EUR and USD: " + ratio_curr.rates.USD, '\n');
    price = Math.round(price_stock.data[0].marketprice*ratio_curr.rates.USD*100);
    price = price + (Math.floor(Math.random()*0.10*price)-(0.05*price)); // Let's say there is a price range of +5% and -5%
    validFrom_temp = new Date(Date.now()-60000)
    validFrom = validFrom_temp.toISOString();
    product = '{"deviceType":["Solar;Photovoltaic;Classic silicon"]}';
    assetId = await Promise.resolve(randAssetId());
    status = 'Active';
    side = 'Ask';
    const values = [userId.toString(), startV, currV, price, validFrom, product, assetId.toString(), status, side];
    //console.log(values);
    return values;
} 

// generate a new entry
async function fillDB() {
    var values = await Promise.resolve(generateRandomEntries());
    await new Promise(resolve => setTimeout(resolve, 1000));
    var query = ('INSERT INTO public."exchange_order" ("userId", "startVolume", "currentVolume", price, "directBuyId", "validFrom", product, "assetId", "demandId", "status", "side") VALUES (\'' + values[0] + '\', ' + values[1].toString() + ', ' + values[2].toString() + ', ' + values[3].toString() + ', NULL, \'' + values[4] + '\', \'' + values[5] + '\', \'' + values[6].toString() + '\', NULL, \'Active\', \'Ask\')');
    console.log('fill the database with following query: ' + query);
    try{
        var res = await pool.query(query);
        res = ('SUCCESS', '\n');
    } catch (err){
        res = ('FAILURE', '\n');
    } 
    console.log(res);
    await new Promise(resolve => setTimeout(resolve, 10000));
    fillDB();
    return res;
}
/*
async function initDB(){
    var sql = fs.readFileSync('./connectToEWO/originDatabase/example.sql').toString();
    try{
        var res = await pool.query(sql);
        res = ('SUCCESS initialize database', '\n');
    } catch (err){
        res = ('FAILURE initialize database', '\n');
    } 
    console.log(res);
}
*/
// initDB();
fillDB();