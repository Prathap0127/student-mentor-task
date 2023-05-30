const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

const dbName = "studentmentor";

const dbUrl = `mongodb+srv://prathap27:prathap27@cluster0.6nroldb.mongodb.net/${dbName}`;

module.exports = { mongodb, MongoClient, dbName, dbUrl };
