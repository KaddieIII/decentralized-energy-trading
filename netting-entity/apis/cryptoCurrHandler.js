function getEWTvalue() {
    // https://coinmarketcap.com/

    var https = require("https");

    return new Promise((resolve, reject) => {
        var options = {
            host: 'pro-api.coinmarketcap.com',
            path: '/v1/cryptocurrency/listings/latest?start=1&limit=200&convert=USD',
            /*
            qs: {
                'start': '1',
                'limit': '200',
                'convert': 'EUR'
            },
            */
            headers: {
                'X-CMC_PRO_API_KEY': '566b1633-12f9-44e7-98e1-58d9563d0a2f'
            },
            json: true,
            gzip: true
        };

        https.get(options, function (https_res) {
            // initialize the container for our data
            var data = "";

            // this event fires many times, each time collecting another piece of the response
            https_res.on("data", function (chunk) {
                // append this chunk to our growing `data` var
                data += chunk;
            });

            // this event fires *one* time, after all the `data` events/chunks have been gathered
            https_res.on("end", function () {
                //let price;
                try {
                    const parsedData = JSON.parse(data);
                    var index = 0;
                    for (i in parsedData.data){
                        if((parsedData.data[i].symbol == 'EWT') || (parsedData.data[i].name == 'Energy Web Token')){
                            //console.log('EWT: ', parsedData.data[i]);
                            index = i;
                        }
                    }
                    //price = parsedData.data[index].quote.USD.price;
                    //console.log(parsedData.data[index]);
                    resolve(parsedData.data[index].quote.USD);
                } catch (e) {
                    reject(e.message);
                }
                //return price;
            });
        });
    });
}
exports.getEWTvalue = getEWTvalue();