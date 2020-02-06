let mongoose = require('mongoose');

function getConnection() {
    return mongoose.connection;
}

function makeConnection(uri){
    mongoose.createConnection(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    // mongoose.createConnection('mongodb://user:pass@localhost:port/database', { autoIndex: false });
    return {
        setOnCompleteListener: function (callback) {
            let db = getConnection();
            callback(db)
        }
    };
}


module.exports = {
    DatabaseConnector: makeConnection,
    getConnection: getConnection
};