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
  getallitems,
  additems,
  modifyorder,
  lockorder,
} = require("../controllers/ordercontroller");
router.post("/postorder", protectinstitute, createorder);
router.get("/", protectshg, getallorders);
router.get("/department", protectdepartment, getorderbydepartment);
router.get("/institute", protectinstitute, getorderbyinstitute);
//both item route are public need to verify who can post items and who can get items
router.get("/getallitems", getallitems);
router.post("/additem", additems);
router.post("/lock", protectinstitute, lockorder);
router.delete("/deleteorder", protectinstitute, deleteorder);
router.put("/modifyorder/:id", protectinstitute, modifyorder);
module.exports = router;
