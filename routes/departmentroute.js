const express = require("express");
const { protectdepartment } = require("../middleware/authmiddleware");
const router = express.Router();
const {
  registerdepartment,
  logindepartment,
  instituteunderdepartment,
  approveorder,
} = require("../controllers/departmentcontroller");
router.post("/register", registerdepartment);
router.post("/login", logindepartment);
router.get("/institute", protectdepartment, instituteunderdepartment);
//to be completed
// router.post("/approveorder", protectdepartment, approveorder);
module.exports = router;
