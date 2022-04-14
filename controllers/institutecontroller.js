const Institute = require("../models/institutemodel");
const asyncHandler = require("express-async-handler");

const registerinstitute = asyncHandler(async (req, res) => {
  const { name, location, contact, department } = req.body;
  if (!name || !location || !contact || !department) {
    return res.status(400).json({
      error:
        "Please provide all the required fields name location contact department",
    });
  }

  const institute = new Institute({
    name,
    location,
    contact,
    department,
  });
  await institute.save();
  res.status(200).json({
    success: true,
    data: institute,
  });
});

module.exports = { registerinstitute };
