var express = require("express");
var router = express.Router();
const { MongoClient } = require("mongodb");

const url = "mongodb://127.0.0.1:27017/";
var client;
const dbName = "test";
const collectionName = "Student";
async function getCollection() {
  client = new MongoClient(url, { useUnifiedTopology: true });
  return (await client.connect()).db(dbName).collection(collectionName);
}

router.get("/by/name/:name", async (req, res) => {
  var query;
  var collection = await getCollection();
  if (req.params.name) {
    query = { name: req.params.name, doc: { $exists: true } };
    const person = await collection.findOne(query);
    await client.close();
    if (person) {
      res.send(person);
    } else {
      res.send({ err: "No Active Case under name " + req.params.name });
    }
  } else {
    res.send({ err: "Could not find Parameter Name" });
  }
});

router.get("/:id", async (req, res) => {
  var query;
  var collection = await getCollection();
  if (req.params.id) {
    query = { _id: req.params.id, doc: { $exists: true } };
    const person = await collection.findOne(query);
    await client.close();
    if (person) {
      res.send(person);
    } else {
      res.send({ err: "No Active Case under ID " + req.params.id });
    }
  } else {
    res.send({ err: "Could not find Parameter ID" });
  }
});

router.post("/", async (req, res) => {
  var collection = await getCollection();
  const response = await collection.insertOne(req.body);
  await client.close();
  if (response) {
    res.send({ _id: response.ops[0]["_id"] });
  } else {
    res.send({ err: "Ooof" });
  }
});

router.get("/all", async (req, res) => {
  try {
    var arr = [];
    const collection = await getCollection();
    const query = { doc: { $exists: true } };
    const cursor = await collection.find(query);
    await cursor.forEach((elem) => arr.push(elem));
    res.send(arr);
  } finally {
    await client.close();
  }
});

module.exports = express.Router().use("/contact", router);
