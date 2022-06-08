const { addnewzone, addinstitutetozone, addshgtozone } = require('../controllers/zonecontroller');
const express = require('express');
const router = express.Router();
const { protectceo } = require('../middleware/authmiddleware');
router.post('/add', protectceo, addnewzone);
router.post("/addinstitute", protectceo, addinstitutetozone);
router.post("/addshg", protectceo, addshgtozone);
module.exports = router;