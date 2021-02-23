var express = require("express")
var router = express.Router()

router.post("/contact", function (req, res, next) {
    res.send("Twilio Send Contact")
})

router.post("/case", (req, res, next) => {
    res.send("Twilio Send Case")
})

router.post("/case/all", (req, res, next) => {
    res.send("Twilio Send Case All")
})

router.post("/contact/all", function (res, end, next) {
    res.send("Twilio Send Contact All")
})

module.exports =  express.Router().use("/messaging", router);
