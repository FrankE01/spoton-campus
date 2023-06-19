const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const { db } = require("../config/firebase.js");
const { verifyUserToken } = require("../middlewares/guard.js");

/* GET users listing. */
router.get("/details", verifyUserToken, function (req, res, next) {
  res.send(req.user);
});

router.get("/a", function (req, res, next) {
  console.log(req.session.cookie.username);
  console.log(req.session.id);
  res.send("respond with a resource");
});

router.post("/create", async (req, res, next) => {
  res.send(req.body);
});

module.exports = router;
