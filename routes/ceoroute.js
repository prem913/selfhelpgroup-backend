const express = require("express");
const {getOrderbyId, getOrdersbyDepartment} = require("../controllers/ceocontroller");
const {protectdepartment, protectceo} = require("../middleware/authmiddleware")

const router = express.Router();
router.post("/getorderbyid",[protectdepartment,protectceo],getOrderbyId);
router.post("/getordersbydepartment",[protectdepartment,protectceo],getOrdersbyDepartment)

module.exports=router;