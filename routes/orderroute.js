const express = require("express");
const router = express.Router();
const { protectdepartment } = require("../middleware/authmiddleware");
const {
  createorder,
  getallorders,
  getorderbydepartment,
} = require("../controllers/ordercontroller");
router.post("/postorder", protectdepartment, createorder);
router.get("/", getallorders);
router.get("/department", protectdepartment, getorderbydepartment);
module.exports = router;
