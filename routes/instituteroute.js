const express = require("express");
const router = express.Router();
const { protectinstitute } = require("../middleware/authmiddleware");
const {
  registerinstitute,
  approveorder,
  saveorder,
  getsavedorder,
  deletesavedorder,
} = require("../controllers/institutecontroller");

router.post("/register", registerinstitute);
router.post("/approveorder", protectinstitute, approveorder);
router.post("/saveorder", protectinstitute, saveorder);
router.get("/getsavedorder", protectinstitute, getsavedorder);
router.delete("/deletesavedorder", protectinstitute, deletesavedorder);
//This route is attached to department login
// router.post("/login",institutelogin);
module.exports = router;
