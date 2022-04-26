const express = require("express");
const {
  protectdepartment,
  combinedprotector,
} = require("../middleware/authmiddleware");
const router = express.Router();
const {
  registerdepartment,
  logindepartment,
  instituteunderdepartment,
  approveorder,
  getshgdata,
  approvefordisplay,
  profile,
} = require("../controllers/departmentcontroller");
router.post("/register", registerdepartment);
router.post("/login", logindepartment);
router.get("/institute", protectdepartment, instituteunderdepartment);
router.post("/approveorder", protectdepartment, approveorder);
router.get("/getshgdata", protectdepartment, getshgdata);
router.post("/approvefordisplay", protectdepartment, approvefordisplay);
router.get("/profile", combinedprotector, profile);
module.exports = router;
