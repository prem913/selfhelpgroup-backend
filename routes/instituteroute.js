const express = require("express");
const router = express.Router();
const { protectinstitute } = require("../middleware/authmiddleware");
const {
  registerinstitute,
  approveorder,
} = require("../controllers/institutecontroller");

router.post("/register", registerinstitute);
router.post("/approveorder", protectinstitute, approveorder);
//This route is attached to department login
// router.post("/login",institutelogin);
module.exports = router;
