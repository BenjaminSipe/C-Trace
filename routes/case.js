const { response } = require("express");
var express = require("express");
var router = express.Router();
const { ObjectID, MongoClient } = require("mongodb");
var getCollection = require("../connectors");

router.get("/recovered/all", (req, res) => {
  getCollection(async (collection) => {
    const query = {
      status: "Recovered",
      deleted: { $exists: false },
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
        deleted: { $exists: false },
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
          deleted: { $exists: false },
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

router.delete("/:id", async (req, res) => {
  if (req.params.id) {
    await getCollection(async (collection) => {
      query = {
        _id: ObjectID(req.params.id),
      };
      const person = await collection.updateOne(query, {
        $set: { deleted: true },
      });
      if (person.modifiedCount === 1) {
        res.send({ message: "successfully deleted case" });
      } else if (person.matchedCount > 0 && person.modifiedCount === 0) {
        res.send({ err: "Patient already marked as deleted" });
      } else {
        res.status(400).send({ err: "Unable to find patient" });
      }
    });
  } else {
    res.send({ err: "Could not find Parameter ID" });
  }
});

router.post("/:id", async (req, res) => {
  if (req.params.id) {
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
          immunityEnd: { $gte: new Date() },
        };
        filter[item.type.toLowerCase()] = item.info;
        // filter.immunityEnd["$gte"] = new Date();
        return (await collection.find(filter).count()) === 1;
      })
      .map(async (item) => {
        let filter = {
          name: item.name,
        };
        filter[item.type.toLowerCase()] = item.info;
        var response = await collection.findOne(filter);

        let entry = {
          name: item.name,
          doc: new Date(item.doc),
          status: "Exposed",
          form: true,
        };
        if (response) {
          query.contacts.push({ _id: response._id });
          response = collection.updateOne(
            { _id: ObjectID(response._id) },
            { $set: entry }
          );
          return new Promise((res, rej) => {
            res(response);
          });
        } else {
          entry[item.type.toLowerCase()] = item.info;
          response = await collection.insertOne(entry);
          query.contacts.push({ _id: response.ops[0]["_id"] });
          return new Promise((res, rej) => {
            res(response);
          });
        }
      });
    Promise.all(promises)
      .then(async () => {
        let { dot, doso, dob } = query;
        let releaseDate;

        if (doso) {
          // releaseDate = new Date(doso);

          query.doso = new Date(doso);
        }
        if (dot) {
          // releaseDate = new Date(dot);
          query.dot = new Date(dot);
        }
        if (dob) {
          query.dob = new Date(dob);
        } //This is wrong.
        // releaseDate.setTime(releaseDate.getTime() + 14);
        console.log(query);

        response = await collection.findOneandUpdate(
          { _id: ObjectID(req.params.id) },
          { $set: query }
        );
        if (response.value) {
          var d = new Date(
            response.value.dot ? response.value.dot : response.value.doso
          );
          d.setDate(d.getDate() + 14);
          res.send({ _id: req.params.id, releaseDate: releaseDate });
        } else {
          res.send({ err: "Something messed up." });
        }
      })
      .then(() => client.close());
  } else {
    res.status(400).send({ err: "No id in params" });
  }
});

router.get("/all", async (req, res) => {
  getCollection(async (collection) => {
    var arr = [];
    const query = {
      status: "Positive",
      deleted: { $exists: false },
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
