const express = require("express");
const {
  getOrderbyId,
  getOrdersbyDepartment,
  getDepartments,
  changeBidPrice,
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

router.post("/changebidprice",changeBidPrice); 
module.exports = router;
