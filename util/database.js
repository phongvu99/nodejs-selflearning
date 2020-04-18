const MongoClient = require('mongodb').MongoClient;

const DB_PASSWORD = process.env.DB_PASSWORD;

// Connection URI
const uri = `mongodb+srv://phongvu99:${DB_PASSWORD}@nodejs-course-6joar.mongodb.net/shop?retryWrites=true&w=majority`

// Database Name
const dbName = 'shop';


const mongoClient = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let _db;

// Use connect method to connect to the server
const mongoConnect = cb => {
    mongoClient.connect()
        .then(client => {
            _db = client.db(dbName);
            console.log('Connected successfully to server');
            cb && cb();
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
}


const getDB = () => {
    if (_db) return _db;
    throw 'No Database Found!';
}

module.exports = {
    mongoConnect: mongoConnect,
    getDB: getDB
};