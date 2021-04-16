const express = require('express')
const db_helper = require('./originDatabase/index')
const app = express()
const port = 3020
/*
async function readBids() {
    bids = await Promise.resolve(db_helper.readBids); // readBids
    return bids;
}
*/
async function readAsks() {
    asks = await Promise.resolve(db_helper.readAsks); // readBids
    return asks;
}



// get asks from marketplace
// URL: http://127.0.0.1:{port}/asks
app.get('/asks/solar', (req, res) => {
  readAsks()
    .then(response => {
        res.send(response.toString())
    });
})

/*
// get bids from marketplace
// URL: http://127.0.0.1:{port}/bids
app.get('/bids/solar', (req, res) => {
  readBids()
    .then(response => {
        res.send(response.toString())
    });
})
*/





// create ask. // Hint: have to be registered to do so // not part of this bachelor thesis
// URL: http://127.0.0.1:{port}/createAsk
app.get('/createAsk', (req, res) => {
    /* TODO */
  res.send('createAsk!')
})









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




app.listen(port, () => {
  console.log(`Origin Server listening at http://localhost:${port}`)
})