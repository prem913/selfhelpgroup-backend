const express = require("express");
const router = express.Router();
const {
  registerinstitute,
  institutelogin,
} = require("../controllers/institutecontroller");

router.post("/register", registerinstitute);
//This route is attached to department login
// router.post("/login",institutelogin);
module.exports = router;
