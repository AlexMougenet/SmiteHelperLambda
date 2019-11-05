
const https = require('https');

function httpGet(url) {
    return new Promise ((resolve, reject) => {
        let chunks = [];
        https.get(url, (res) => {
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

























