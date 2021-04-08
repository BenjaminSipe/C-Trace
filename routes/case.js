var express = require("express");
var router = express.Router();
const { MongoClient, ObjectID } = require("mongodb");

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
    query = { name: req.params.name, doc: { $exists: false } };
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

router.get("/:id", async (req, res, next) => {
  var query;
  var collection = await getCollection();
  if (req.params.id) {
    if (req.params.id == "all") {
      next();
    } else {
      query = { _id: ObjectID(req.params.id), doc: { $exists: false } };
      const person = await collection.findOne(query);
      await client.close();
      if (person) {
        res.send(person);
      } else {
        res.send({ err: "No Active Case under id " + req.params.id });
      }
    }
  } else {
    res.send({ err: "Could not find Parameter ID" });
  }
});

router.post("/", async (req, res) => {
  // console.log(req.body);
  // res.send("test");
  var collection = await getCollection();

  var promises = req.body.contacts.map(async (item) => {
    let entry = { name: item.name };
    entry[item.type.toLowerCase()] = item.info;
    const response = await collection.insertOne(entry);
    item = { _id: response.ops[0]["_id"] };
    return new Promise((res, rej) => {
      res(response);
    });
  });

  Promise.all(promises).then(async (results) => {
    const response = await collection.insertOne(req.body);
    await client.close();
    if (response) {
      res.send({ _id: response.ops[0]["_id"] });
    } else {
      res.send({ err: "Ooof" });
    }
  });
});

router.get("/all", async (req, res) => {
  try {
    var arr = [];
    const collection = await getCollection();
    const query = { doc: { $exists: false } };
    const cursor = await collection.find(query);
    await cursor.forEach((elem) => arr.push(elem));
    res.send(arr);
  } finally {
    await client.close();
  }
});

module.exports = express.Router().use("/case", router);

/*
Tuesday : Class time React, --
Tuesday : Evening: 8-10:30 Status Report
Thursday : Class time React/Status meeting,
Friday : 2:30-5 React--


*/
