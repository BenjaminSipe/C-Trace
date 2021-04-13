const url = "mongodb://127.0.0.1:27017/";
const dbName = "test";
const collectionName = "Student";
const { MongoClient } = require("mongodb");

async function getCollection(callback) {
  let client = new MongoClient(url, { useUnifiedTopology: true });
  const collection = (await client.connect())
    .db(dbName)
    .collection(collectionName);
  return callback(collection).then(() => {
    client.close();
  });
}

module.exports = getCollection;
