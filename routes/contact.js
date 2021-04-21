var express = require("express");
var router = express.Router();
const { ObjectID } = require("mongodb");
var getCollection = require("../connectors");

router.get("/by/name/:name", async (req, res) => {
  await getCollection(async (collection) => {
    if (req.params.name) {
      const query = {
        name: req.params.name,
        status: "Exposed",
      };
      const person = await collection.findOne(query);
      if (person) {
        res.send(person);
      } else {
        res.send({ err: "No Active Contact under name " + req.params.name });
      }
    } else {
      res.send({ err: "Could not find Parameter Name" });
    }
  });
});

router.get("/:id", async (req, res, next) => {
  await getCollection(async (collection) => {
    if (req.params.id) {
      if (req.params.id == "all") {
        next();
      } else {
        var query = {
          _id: ObjectID(req.params.id),
          status: "Exposed",
        };
        const person = await collection.findOne(query);
        if (person) {
          res.send(person);
        } else {
          res.send({ err: "No Active Contact under ID " + req.params.id });
        }
      }
    } else {
      res.send({ err: "Could not find Parameter ID" });
    }
  });
});

router.post("/", async (req, res) => {
  getCollection(async (collection) => {
    // let { doc, dob } = req.body;
    let { _id, doc, dob, ...query } = { ...req.body, status: "Exposed" };
    if (doc) {
      query.doc = new Date(doc);
    }
    if (dob) {
      query.dob = new Date(dob);
    }
    if (_id) {
      res.status(400).send({ err: "no id provided" });
    } else {
      var response = await collection.updateOne(
        { _id: ObjectID(_id) },
        { $set: query }
      );
      // console.log(response);
      if (response) {
        res.send({ message: "Completed Correctly" });
      } else {
        res.send({ err: "Ooof" });
      }
    }
  });
});

router.get("/all", async (req, res) => {
  await getCollection(async (collection) => {
    const query = { status: "Exposed" };
    var arr = [];
    const cursor = await collection.find(query);
    await cursor.forEach((elem) => arr.push(elem));
    res.send(arr);
  });
});

module.exports = express.Router().use("/contact", router);
