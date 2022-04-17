const express = require("express");
const router = express.Router();
const {
  protectinstitute,
  protectdepartment,
} = require("../middleware/authmiddleware");
const {
  createorder,
  getallorders,
  getorderbydepartment,
  getorderbyinstitute,
} = require("../controllers/ordercontroller");
router.post("/postorder", protectinstitute, createorder);
router.get("/", getallorders);
router.get("/department", protectdepartment, getorderbydepartment);
router.get("/institute", protectinstitute, getorderbyinstitute);
module.exports = router;
