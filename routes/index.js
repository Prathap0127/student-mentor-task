var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send(`<h2>Student mentor Task<h2/>`);
});

module.exports = router;
