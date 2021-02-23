var express = require('express');
var router = express.Router();

router.route('/case')

  .get((req, res) => {
  res.send("Get Case")
})
  .post((req, res)=> {
  res.send("Post Case")
})

router.get("/case/all", (req, res) => {
  res.send("Get Case All")
})

module.exports = router;
