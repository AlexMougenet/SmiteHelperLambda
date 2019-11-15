const https = require('https');
const options = {
    headers: {
      "x-api-key": "31f82e63-e734-44d0-8598-a5ee96fd6a3c"
    }
};

function httpGet(url) {
    return new Promise ((resolve, reject) => {
        let chunks = [];
        https.get(url, options, (res) => {
            res.on('data', (d) => {
                chunks.push(d);
            });
            res.on('end', () => {
                let data = Buffer.concat(chunks);
                let schema = JSON.parse(data);
                resolve(schema);
            });
        }).on('error', (e) => {
            reject(e);
        });
    });
}


module.exports={
   httpGet : httpGet
};

























