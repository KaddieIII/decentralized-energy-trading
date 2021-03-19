function getMarketPrice() {

    var https = require("https");

    return new Promise((resolve, reject) => {
        var options = {
            host: 'api.awattar.de',
            path: '/v1/marketdata'
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
                try {
                    //console.log(data);
                    const parsedData = JSON.parse(data);
                    //console.log(parsedData);
                    resolve(parsedData);
                } catch (e) {
                    reject(e.message);
                }
            });
        });
    });
}
exports.getMarketPrice = getMarketPrice();