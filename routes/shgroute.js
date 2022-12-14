const express = require("express");
const { protectshg, protectceo } = require("../middleware/authmiddleware");
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
  getapprovedproducts,
  getprofile,
  orderdelivered,
  getcompletedorders
} = require("../controllers/shgcontroller");
router.post("/register", protectceo, registershg);
router.post("/login", shglogin);
router.post("/verifyotp", verifyOtp);
router.post("/addproducts", protectshg, addproducts);
router.get("/getproducts", protectshg, getproducts);
router.post("/bid", protectshg, bid);
router.put("/updateproduct", protectshg, updateproduct);
router.delete("/deleteproduct", protectshg, deleteproduct);
router.get("/getapprovedproducts", protectshg, getapprovedproducts);
router.get("/getcompletedorders", protectshg, getcompletedorders);
router.get("/profile", protectshg, getprofile);
router.post("/orderdelivered", protectshg, orderdelivered);
module.exports = router;
