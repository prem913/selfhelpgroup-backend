const express = require("express");
const {
  getOrderbyId,
  getOrdersbyDepartment,
  getDepartments,
  changeBidPrice,
  getallorders,
  getallinstitutes,
  getshgdata,
} = require("../controllers/ceocontroller");
const {
  protectdepartment,
  protectceo,
} = require("../middleware/authmiddleware");

const router = express.Router();
router.post("/getorderbyid", [protectdepartment, protectceo], getOrderbyId);
router.post(
  "/getordersbydepartment",
  [protectdepartment, protectceo],
  getOrdersbyDepartment
);
router.get("/getdepartments", [protectdepartment, protectceo], getDepartments);
router.get("/getallorders", protectceo, getallorders);
router.get("/getallinstitutes", protectceo, getallinstitutes);
router.get("/getshgdata", protectceo, getshgdata);
router.post("/changebidprice", changeBidPrice);
module.exports = router;
