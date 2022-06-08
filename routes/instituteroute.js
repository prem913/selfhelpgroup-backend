const express = require("express");
const router = express.Router();
const { protectinstitute, protectceo } = require("../middleware/authmiddleware");
const {
  registerinstitute,
  approveorder,
  saveorder,
  getsavedorder,
  deletesavedorder,
  verifydelivery
} = require("../controllers/institutecontroller");

router.post("/register", protectceo, registerinstitute);
router.post("/approveorder", protectinstitute, approveorder);
router.post("/saveorder", protectinstitute, saveorder);
router.get("/getsavedorder", protectinstitute, getsavedorder);
router.delete("/deletesavedorder", protectinstitute, deletesavedorder);
router.post("/verifydelivery", protectinstitute, verifydelivery);
//This route is attached to department login
// router.post("/login",institutelogin);
module.exports = router;
