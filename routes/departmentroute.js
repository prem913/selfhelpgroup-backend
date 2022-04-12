const express = require("express");
const router = express.Router();
const {
  registerdepartment,
  logindepartment,
} = require("../controllers/departmentcontroller");
router.post("/register", registerdepartment);
router.post("/login", logindepartment);
module.exports = router;
