const express = require("express");
const { protectshg } = require("../middleware/authmiddleware");
const router = express.Router();
const {
  registershg,
  shglogin,
  verifyOtp,
  addproducts,
  bid,
  getproducts,
  updateproduct,
  deleteproduct,
} = require("../controllers/shgcontroller");
router.post("/register", registershg);
router.post("/login", shglogin);
router.post("/verifyotp", verifyOtp);
router.post("/addproducts", protectshg, addproducts);
router.get("/getproducts", protectshg, getproducts);
router.post("/bid", protectshg, bid);
router.put("/updateproduct", protectshg, updateproduct);
router.delete("/deleteproduct", protectshg, deleteproduct);
module.exports = router;
