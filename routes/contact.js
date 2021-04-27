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
        deleted: { $exists: false },
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
          deleted: { $exists: false },
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

router.delete("/:id", async (req, res) => {
  if (req.params.id) {
    await getCollection(async (collection) => {
      query = {
        _id: ObjectID(req.params.id),
        status: "Exposed",
      };
      const person = await collection.updateOne(query, {
        $set: { deleted: true },
      });
      if (person.modifiedCount === 1) {
        res.send({ message: "successfully deleted contact" });
      } else if (person.matchedCount > 0 && person.modifiedCount === 0) {
        res.status(202).send({ err: "Patient already marked as deleted" });
      } else {
        res.status(400).send({ err: "Unable to find patient" });
      }
    });
  } else {
    res.status(400).send({ err: "Could not find Parameter ID" });
  }
});
router.get("/past/all", (req, res) => {
  getCollection(async (collection) => {
    const query = {
      status: "Past",
      deleted: { $exists: false },
    };
    let arr = [];
    const cursor = await collection.find(query);
    await cursor.forEach((elem) => arr.push(elem));
    res.send(arr);
  });
});
router.post("/:id", async (req, res) => {
  getCollection(async (collection) => {
    // let { doc, dob } = req.body;
    let { doc, dob, ...query } = { ...req.body, status: "Exposed" };
    if (doc) {
      query.doc = new Date(doc);
    }
    if (dob) {
      query.dob = new Date(dob);
    }
    if (!req.params.id) {
      console.log("is this the error that I'm getting?");
      console.log(req.params.id);
      res.status(400).send({ err: "no id provided" });
    } else {
      var response = await collection.findOneAndUpdate(
        { _id: ObjectID(req.params.id) },
        { $set: query }
      );
      // console.log(response);
      if (response.value) {
        var d = new Date(response.value.doc);
        d.setDate(d.getDate() + 14);
        res.send({ message: "Completed Correctly", releaseDate: d });
      } else {
        res.send({ err: "Ooof" });
      }
    }
  });
});

router.get("/all", async (req, res) => {
  await getCollection(async (collection) => {
    const query = { status: "Exposed", deleted: { $exists: false } };
    var arr = [];
    const cursor = await collection.find(query);
    await cursor.forEach((elem) => arr.push(elem));
    res.send(arr);
  });
});

module.exports = express.Router().use("/contact", router);
