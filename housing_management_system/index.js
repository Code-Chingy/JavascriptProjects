/*
    Created By TechUpStudio.Otc_Chingy
 */

const HMS = require('./main/hms_app_server/server.js');


function startAppServer(){

    HMS.Database.DatabaseConnector('mongodb://localhost/hm_system_db').setOnCompleteListener((connection)=>{

        connection.on('error', console.error.bind(console, 'database connection failed: '));
        connection.once('open', function() {

            console.log("database connection successfully");

            //Start Server
            let HMSAPIServer = HMS.AppServer.listen(3000, ()=>{
                let host = HMSAPIServer.address().address;
                let port = HMSAPIServer.address().port;
                console.log("Running App Server: http://%s:%s", host, port)
            });

        });

    });
}


startAppServer();

// let crypto = require('crypto');

// const cipher = crypto.createCipher('aes192', 'techupstudio@web.app');
// let encrypted = cipher.update('some clear text data thth y yhyuyu ', 'utf8', 'hex');
// console.log('encrypted: ' + encrypted);
// encrypted += cipher.final('hex');
// console.log('encrypted final: ' + encrypted);
//
// const decipher = crypto.createDecipher('aes192', 'techupstudio@web.app');
// let decrypted = decipher.update(encrypted, 'hex', 'utf8');
// console.log('decrypted: ' + decrypted);
//
// const hash = crypto.createHash('sha256');
// hash.update('some data to hash');
// console.log('digest: ' + hash.digest('hex'));


// const ciphers = crypto.getCiphers();
// const hashes = crypto.getHashes();
// console.log('cipers: ' + ciphers);
// console.log('hashes: ' + hashes);


