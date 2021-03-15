function getRatio() {
    // https://fixer.io/quickstart

    var http = require("http");

    return new Promise((resolve, reject) => {
        http.get('http://data.fixer.io/api/latest?access_key=faa039ff1c814fcda7411cd4a7911a13', function (http_res) {
            // initialize the container for our data
            var data = "";

            // this event fires many times, each time collecting another piece of the response
            http_res.on("data", function (chunk) {
                // append this chunk to our growing `data` var
                data += chunk;
            });

            // this event fires *one* time, after all the `data` events/chunks have been gathered
            http_res.on("end", function () {
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