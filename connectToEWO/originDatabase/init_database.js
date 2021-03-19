const { Pool } = require('pg')
var fs = require('fs');
const config = require('./db_config');
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

initDB();
