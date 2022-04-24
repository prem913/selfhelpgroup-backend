const express = require("express");
const { protectdepartment } = require("../middleware/authmiddleware");
const router = express.Router();
const {
  registerdepartment,
  logindepartment,
  instituteunderdepartment,
  approveorder,
  getshgdata,
  approvefordisplay,
} = require("../controllers/departmentcontroller");
router.post("/register", registerdepartment);
router.post("/login", logindepartment);
router.get("/institute", protectdepartment, instituteunderdepartment);
router.post("/approveorder", protectdepartment, approveorder);
router.get("/getshgdata", protectdepartment, getshgdata);
router.post("/approvefordisplay", protectdepartment, approvefordisplay);
module.exports = router;
