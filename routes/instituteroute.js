const express = require("express");
const router = express.Router();
const { registerinstitute } = require("../controllers/institutecontroller");

router.post("/register", registerinstitute);
module.exports = router;
