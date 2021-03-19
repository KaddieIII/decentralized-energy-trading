const { Pool} = require('pg')
const util = require('util')
const fs = require('fs');
const config = require('./db_config');
const { start } = require('repl');

const pool = new Pool({
  user: config.user,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port,
})
pool.connect()

/* get data from database */
async function selectFrom(side) {
  try {
    let res;
    if (side == 0){
      res = await pool.query(
        'SELECT "createdAt",price,product FROM public."exchange_order" WHERE (side = \'Bid\') AND (product ->> \'deviceType\' LIKE \'%Solar%\')'
      );
    }else if (side == 1){
      res = await pool.query(
        'SELECT "createdAt",price,product FROM public."exchange_order" WHERE (side = \'Ask\') AND (product ->> \'deviceType\' LIKE \'%Solar%\')'
      );
    }
    //console.log(res);
    return res;
  } catch (err) {
    //console.log('why?');
    return (err.stack);
  }
}

/* get avg asks and bids from past x minutes*/
/**
 * 
 * @param {0,1} side  --> 0 = bid, 1 = ask
 * @param {*} timestamp when the netting triggers
 * @param {int} x netting-intervall in minutes
 * @returns avgasks or avgbids in US-ct
 */
async function readData (side, timestamp, x) {
  try{
    endtime = timestamp; // wir möchten den Marktwert von Strom aus den letzten x Minuten wissen. Also Zeitintervall: [now - x Minuten, now]
    starttime = endtime - (60000*x);

    var data = await selectFrom(side);

    var count_data = 0;
    var sum_data = 0;
    for (i in data.rows){
      if((data.rows[i].createdAt.getTime() >= starttime) && (data.rows[i].createdAt.getTime()) <= endtime){
        sum_data += data.rows[i].price;
        count_data ++;
      }
    }
    if (count_data != 0){
      var avg_data = sum_data/count_data;
      console.log('AVG_DATA: ' + avg_data)
      return avg_data;
    }else{
      //console.log('-1');
      return -1;
    }
  } catch(err){
    return -1;
  }
}

exports.readBids = readData(0, time = Date.now(), 200);
exports.readAsks = readData(1, time = Date.now(), 200);