const express = require("express");
const router = express.Router();
const {
  protectinstitute,
  protectdepartment,
  protectshg,
} = require("../middleware/authmiddleware");
const {
  createorder,
  getallorders,
  getorderbydepartment,
  getorderbyinstitute,
  deleteorder,
} = require("../controllers/ordercontroller");
router.post("/postorder", protectinstitute, createorder);
router.get("/", protectshg, getallorders);
router.get("/department", protectdepartment, getorderbydepartment);
router.get("/institute", protectinstitute, getorderbyinstitute);
//to be completed
router.delete("/deleteorder", protectinstitute, deleteorder);
module.exports = router;
