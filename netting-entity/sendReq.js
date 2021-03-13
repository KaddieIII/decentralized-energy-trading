function getData(side) {

    var https = require("http");

    return new Promise((resolve, reject) => {
        var options = {
            host: 'localhost',
            port: 3020,
            path: side
        };

        https.get(options, function (https_res) {
            // initialize the container for our data
            var data = "";

            // this event fires many times, each time collecting another piece of the response
            https_res.on("data", function (chunk) {
                data += chunk; // append this chunk to our growing `data` var
            });

            // this event fires *one* time, after all the `data` events/chunks have been gathered
            https_res.on("end", function () {
                try {
                    //const parsedData = JSON.parse(data);
                    // console.log(data);
                    resolve(data);
                } catch (e) {
                    reject(e.message);
                }
            });
        });
    });
}
exports.getAsks = getData('/asks/solar');
exports.getBids = getData('/bids/solar');
exports.claimCertificate = getData('/issueCertificate');
exports.createAsk = getData('/createAsk'); // vermutlich eher PUT!