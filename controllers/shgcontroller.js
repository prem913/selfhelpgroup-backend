const shg = require("../models/shgmodel");
const asynchandler = require("express-async-handler");

const registershg = asynchandler(async (req, res) => {
  const { name, contact, location } = req.body;
  if (!name || !contact || !location) {
    res.status(400).json({
      error: "Please provide all the details name contact and location",
    });
  }
  const shgdata = req.body;
  const newshg = new shg(shgdata);
  await newshg.save();
  res.json({
    message: "SHG registered successfully",
  });
});

module.exports = {
  registershg,
};
