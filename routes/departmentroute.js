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
  profile,
} = require("../controllers/departmentcontroller");
router.post("/register", registerdepartment);
router.post("/login", logindepartment);
router.get("/institute", protectdepartment, instituteunderdepartment);
router.get("/profile", combinedprotector, profile);
module.exports = router;
