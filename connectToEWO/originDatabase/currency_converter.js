function getRatio() {
    var https = require("https");

    return new Promise((resolve, reject) => {
        https.get('https://api.exchangeratesapi.io/latest', function (https_res) {
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
                    const parsedData = JSON.parse(data);
                    //console.log(parsedData.rates.USD);
                    resolve(parsedData);
                } catch (e) {
                    reject(e.message);
                }
            });
        });
    });
}
exports.getRatio = getRatio();