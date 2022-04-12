const express = require("express");
const router = express.Router();
const { registershg } = require("../controllers/shgcontroller");
router.post("/register", registershg);

module.exports = router;
