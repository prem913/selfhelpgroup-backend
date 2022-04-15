const express = require("express");
const router = express.Router();
const { registerinstitute, institutelogin, instituteVerifyOtp } = require("../controllers/institutecontroller");

router.post("/register", registerinstitute);
router.post("/login",institutelogin);
router.post("/verifyotp",instituteVerifyOtp);
module.exports = router;
