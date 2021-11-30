var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json([{ name: "Pranav Kumar", detail:"Web Server Host", project:"hris-backend"}]);
});

module.exports = router;
