var express = require("express");
var router = express.Router();
const { ObjectID } = require("mongodb");
var getCollection = require("../connectors");

router.get("/by/name/:name", async (req, res) => {
  getCollection(async (collection) => {
    if (req.params.name) {
      const query = {
        name: req.params.name,
        $or: [{ doso: { $exists: true } }, { dot: { $exists: true } }],
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
          $or: [{ doso: { $exists: true } }, { dot: { $exists: true } }],
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
  getCollection(async (collection) => {
    var promises = req.body.contacts.map(async (item) => {
      let entry = { name: item.name, doc: item.doc };
      entry[item.type.toLowerCase()] = item.info;
      const response = await collection.insertOne(entry);
      item = { _id: response.ops[0]["_id"] };
      return new Promise((res, rej) => {
        res(response);
      });
    });

    Promise.all(promises).then(async (results) => {
      const response = await collection.insertOne(req.body);
      if (response) {
        res.send({ _id: response.ops[0]["_id"] });
      } else {
        res.send({ err: "Ooof" });
      }
    });
  });
});

router.get("/all", async (req, res) => {
  getCollection(async (collection) => {
    var arr = [];
    const query = {
      $or: [{ doso: { $exists: true } }, { dot: { $exists: true } }],
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
