var express = require("express");
const getCollection = require("../connectors");
var router = express.Router();
const { ObjectID } = require("mongodb");
var twilio = require("twilio");
const nodemailer = require("nodemailer");
const fs = require("fs");
const { request } = require("express");

function contactEmailTemplate(data) {
  return {
    to: data.to, // list of receivers
    subject: "C-Trace Exposure Contact", // Subject line
    text:
      "Hello, " +
      data.name +
      ", you have been in contact with someone " +
      "who just tested positive for COVID19.\n" +
      "According to our records, this contact occured on " +
      data.doc +
      ".\n" +
      "Please follow this link to fill out a Covid Contact Form:" +
      "http://172.25.22.175:8080/contact" +
      (data.params ? "?" + data.params : "") +
      "\nIf you believe this email was sent in error, " +
      "please contact your local health authority for verification." +
      "\n-your local health authority,\n" +
      "This email was generated by C-Trace. For more information go to C-trace.com or contact c.trace.contact@gmail.com.",
  };
}

function caseEmailTemplate(data) {
  return {
    to: data.to, // list of receivers
    subject: "C-Trace COVID Positive Form", // Subject line
    text:
      "Hello " +
      data.name +
      ", according to our records, you have " +
      "tested positive for COVID19 or are developing symptoms " +
      "after a known COVID19 exposure.\n" +
      "Please follow this link to fill out a Covid Postivite Case Form:" +
      "http://172.25.22.175:8080/case" +
      (data.params ? "?" + data.params : "") +
      "\nIf you believe this email was sent in error, " +
      "please contact your local health authority for verification." +
      "\n-your local health authority,\n" +
      "This email was generated by C-Trace. For more information go to C-trace.com or contact c.trace.contact@gmail.com.",
  };
}

async function sendEmail(emailData, res) {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "c.trace.contact@gmail.com", // generated ethereal user
      pass: "sloppy-joes", // generated ethereal password
    },
  });
  // send mail with defined transport object
  let info = await transporter.sendMail({
    ...emailData,
    from: '"College of the Ozarks" <c.trace.contact@gmail.com>',
  });

  res.send({ messageID: info.messageId, to: emailData.to });
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

router.post("/contact/:id", function (req, res, next) {
  if (req.params.id) {
    if (req.params.id == "all") {
      next();
    } else {
      getCollection(async (collection) => {
        const query = { _id: ObjectID(req.params.id), status: "Exposed" };
        const person = await collection.findOne(query);
        if (person) {
          //   if (false) {
          if (person.phone) {
            let rawdata = fs.readFileSync("./tokens.json");
            let { accountSid, authToken } = JSON.parse(rawdata);
            console.log(accountSid);
            var client = new twilio(accountSid, authToken);
            client.messages
              .create({
                body:
                  "Hello, " +
                  person.name +
                  ", you have been in contact with someone " +
                  "who just tested positive for COVID19.\n" +
                  "According to our records, this contact occured on " +
                  person.doc +
                  ",\nPlease click this link to fill out our COVID19 form: http://172.25.21.187:8080/contact" +
                  "\nor contact c.trace.contact@gmail.com for more information.",
                to: "+13145612361", // Text this number
                from: "+14055823794", // From a valid Twilio number
              })
              .then((message) => res.send(message.sid));
            // Do Twilio Code
          } else {
            if (person.email) {
              let emailData = contactEmailTemplate({
                to: '"' + person.name + '" <' + person.email + ">",
                name: person.name,
                doc: person.doc,
              });

              sendEmail(emailData, res);
            } else {
              res
                .status(400)
                .send({ err: "No Contact Info found for id ${id}" });
            }
          }
        } else {
          res
            .status(400)
            .send({ err: "No Active Contact under ID " + req.params.id });
        }
      });
    }
  } else {
    res.status(400).send({ err: "Could not find Parameter ID" });
  }
});

router.post("/case", function (req, res, next) {
  // if (req.params.id) {
  // if (req.params.id == "all") {
  //   next();
  // } else {
  getCollection(async (collection) => {
    const filter = { name: req.body.name };
    filter[req.body.type.toLowerCase()] = req.body.info.toLowerCase();
    const query = { $set: { status: "Positive" } };
    var response = await collection.updateOne(filter, query);
    // console.log(response.modifiedCount);
    if (response.modifiedCount !== 1) {
      const entry = { ...filter, status: "Positive" };
      entry[req.body.dType] = req.body.date;
      const response = await collection.insertOne(entry);
    }

    if (req.body.type === "phone") {
      let rawdata = fs.readFileSync("../tokens.json");
      let { accountSid, authToken } = JSON.parse(rawdata);
      console.log(accountSid);
      var client = new twilio(accountSid, authToken);
      client.messages
        .create({
          body:
            "Please click this link to fill out COVID form http://localhost:8080/case",
          to:
            "+1" +
            req.body.info
              .split("")
              .filter((letter) => "1234567890".split("").includes(letter))
              .join(""), // Text this number
          from: "+14055823794", // From a valid Twilio number
        })
        .then((message) => res.send(message.sid));
      // Do Twilio Code
    } else {
      if (req.body.type === "Email") {
        let emailData = caseEmailTemplate({
          to: '"' + req.body.name + '" <' + req.body.info + ">",
          name: req.body.name,
        });

        sendEmail(emailData, res);
      } else {
        res
          .status(400)
          .send({ err: "No Contact Info found for " + req.body.name });
      }
    }
  });
});

router.post("/case/all", (req, res, next) => {
  res.send("Twilio Send Case All");
});

router.post("/contact/all", function (res, end, next) {
  res.send("Twilio Send Contact All");
});

module.exports = express.Router().use("/messaging", router);
