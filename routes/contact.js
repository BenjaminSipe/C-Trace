var express = require("express");
var router = express.Router()


router.route("/contact").get((req, res) => {
    res.send("contact get")
}).post((req,res) => {
    res.send("contact post")
})

// This is a comment...
router.get("/contact/all", (req, res) => {
    res.send("Contact get all")
});


module.exports = router;