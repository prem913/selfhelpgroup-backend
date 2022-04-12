const express = require("express");
const router = express.Router();
const { registershg,shglogin, verifyOtp } = require("../controllers/shgcontroller");
router.post("/register", registershg);
router.post("/login",shglogin);
router.post("/verifyotp",verifyOtp);
module.exports = router;
