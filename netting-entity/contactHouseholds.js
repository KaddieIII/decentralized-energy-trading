//  const hhsPort = process.env.REACT_APP_HSS_PORT || 3002; 

const households = [
    {host: localhost, port: 3002}, 
    {host: localhost, port: 3003}
];

function getCertificates(host, port, path) {

    var https = require("http");

    return new Promise((resolve, reject) => {
        var options = {
            host: host,
            port: port,
            path: path
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

async function contactHouseholds(households, path){
    for (i in households){
        getCertificates(households[i].host, households[i].port, path)
    }
}

exports.getCertificates = contactHouseholds(households, '/requestCertificates');
