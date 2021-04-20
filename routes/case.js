var express = require("express");
var router = express.Router();
const { ObjectID, MongoClient } = require("mongodb");
var getCollection = require("../connectors");

router.get("/recovered/all", (req, res) => {
  getCollection(async (collection) => {
    let x = new Date();
    x.setDate(x.getDate() - 14);
    const query = {
      status: "Recovered",
    };
    let arr = [];
    const cursor = await collection.find(query);
    await cursor.forEach((elem) => arr.push(elem));
    res.send(arr);
  });
});
router.get("/by/name/:name", (req, res) => {
  getCollection(async (collection) => {
    if (req.params.name) {
      const query = {
        name: req.params.name,
        status: "Positive",
      };
      const person = await collection.findOne(query);
      if (person) {
        res.send(person);
      } else {
        res.send({ err: "No Active Case under name " + req.params.name });
      }
    } else {
      res.send({ err: "Could not find Parameter Name" });
    }
  });
});

router.get("/:id", async (req, res, next) => {
  if (req.params.id) {
    if (req.params.id == "all") {
      next();
    } else {
      await getCollection(async (collection) => {
        query = {
          _id: ObjectID(req.params.id),
          status: "Positive",
        };
        const person = await collection.findOne(query);
        if (person) {
          res.send(person);
        } else {
          res.send({ err: "No Active Case under id " + req.params.id });
        }
      });
    }
  } else {
    res.send({ err: "Could not find Parameter ID" });
  }
});

router.post("/", async (req, res) => {
  const url = "mongodb://127.0.0.1:27017/";
  const dbName = "test";
  const collectionName = "Student";
  let client = new MongoClient(url, { useUnifiedTopology: true });
  const collection = (await client.connect())
    .db(dbName)
    .collection(collectionName);
  var query = { ...req.body, status: "Positive", contacts: [] };
  var promises = req.body.contacts
    .filter(async (item) => {
      let filter = {
        name: item.name,
        status: "Recovered",
        immunityEnd: { $gte: {} },
      };
      filter[item.type.toLowerCase()] = item.info;
      filter.immunityEnd["$gte"] = new Date();
      return await collection.find(filter);
    })
    .map(async (item) => {
      let entry = {
        name: item.name,
        doc: new Date(item.doc),
        status: "Exposed",
      };

      entry[item.type.toLowerCase()] = item.info;
      const response = await collection.insertOne(entry);
      query.contacts.push({ _id: response.ops[0]["_id"] });
      return new Promise((res, rej) => {
        res(response);
      });
    });
  Promise.all(promises)
    .then(async (result) => {
      let { dot, doso, dob } = query;
      if (dot) {
        query.dot = new Date(dot);
      }
      if (doso) {
        query.doso = new Date(doso);
      }
      if (dob) {
        query.dob = new Date(dob);
      }
      const response2 = await collection.insertOne(query);
      if (response2) {
        res.send({ _id: response2.ops[0]["_id"] });
        // resolve("worked properly");
      } else {
        res.send({ err: "Ooof" });
      }
    })
    .then((res) => client.close());
});

router.get("/all", async (req, res) => {
  getCollection(async (collection) => {
    var arr = [];
    const query = {
      status: "Positive",
    };
    const cursor = await collection.find(query);
    await cursor.forEach((elem) => arr.push(elem));
    res.send(arr);
  });
});

module.exports = express.Router().use("/case", router);

/*
Tuesday : Class time React, --
Tuesday : Evening: 8-10:30 Status Report
Thursday : Class time React/Status meeting,
Friday : 2:30-5 React--


*/
