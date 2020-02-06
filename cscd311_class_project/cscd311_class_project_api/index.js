/*
    Name: Atinga Bernard Azumah
    ID  : 10660742
 */

const SAS   = require('./src/app_server/server.js');
const port  = process.env.PORT || 3000;

let path    = require('path');


function startAppServer(){

    SAS.Database.DatabaseConnector('mongodb://localhost/school_db').setOnCompleteListener((connection)=>{

        connection.on('error', console.error.bind(console, 'database connection failed: '));
        connection.once('open', function() {

            console.log("database connection successfully");

            //create dummy data
            require('./src/app_server/models/dummy-data.js')();

            //Start Serve
            let app = SAS.AppServer;

            app.use(require('express').static(path.join(__dirname.toString().replace('api', 'web') + '/public')));
            app.set('views', path.join(__dirname.toString().replace('api', 'web') + '/views'));
            // app.use(require('express').session({ secret: 'techupstudio' }));
            // app.use(express.bodyParser({uploadDir: '.../views/static/public/media'}));

            let APIServer = app.listen(port, ()=>{
                let host = APIServer.address().address;
                let port = APIServer.address().port;
                console.log("Running App Server: http://%s:%s", host, port)
            });

        });

    });
}

startAppServer();