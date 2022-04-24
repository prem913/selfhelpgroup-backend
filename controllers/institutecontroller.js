const Institute = require("../models/institutemodel");
const departmentmodel = require("../models/departmentmodel");
const asyncHandler = require("express-async-handler");
const { createJwtToken } = require("../utils/token");
const bcrypt = require("bcryptjs");
const registerinstitute = asyncHandler(async (req, res) => {
  const { name, location, contact, department, email, password } = req.body;
  if (!name || !location || !contact || !department || !email || !password) {
    return res.status(400).json({
      error:
        "Please provide all the required fields name location contact department email and password",
    });
  }
  const isregistered = await Institute.findOne({ email });
  if (isregistered) {
    res.json({
      success: false,
      message: "email is already registered",
    });
    return;
  }
  const departmentdata = await departmentmodel.findOne({ department });
  if (!departmentdata) {
    res.json({
      message: "department not found",
    });
    return;
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const institute = new Institute({
    name,
    location,
    contact,
    department,
    departmentid: departmentdata._id,
    email,
    password: hashedPassword,
  });
  await institute.save();
  res.status(200).json({
    success: true,
    data: institute,
  });
});

// const institutelogin = asyncHandler(async (req, res) => {
//   const { email,password } = req.body;
//   if (!email || !password) {
//     res.status(400).json({
//       error: "Please provide all the details email and password",
//     });
//     return;
//   }
//   const institutedata = await Institute.findOne({ email });

//   if (!institutedata) {
//     res.status(400).json({
//       message: "Institute Not Found!",
//     });
//     return;
//   }
//   const isMatch = await bcrypt.compare(password, institutedata.password);
//   if (!isMatch) {
//     res.status(400).json({
//       error: "Incorrect password",
//     });
//   }
//   const token = createJwtToken({ instituteId:institutedata._id });
//   res.json({
//     message: "Login successful",
//     token: token,
//   });

// });

// const instituteVerifyOtp = asyncHandler(async (req, res) => {
//   const { instituteId, otp } = req.body;

//   const institutedata = await Institute.findById(instituteId);

//   if (!institutedata) {
//     res.status(400).json({
//       message: "institute not found",
//     });
//     return;
//   }

//   const timenow = new Date().getTime();
//   const timethen = new Date(institutedata.updatedAt).getTime();

//   if (timenow - timethen > 30 * 60 * 1000) {
//     res.status(400).json({
//       message: "Otp is expired",
//     });
//     return;
//   }

//   if (otp !== institutedata.otp) {
//     res.status(400).json({
//       message: "Incorrect Otp",
//     });
//     return;
//   }

//   const jwt = createJwtToken({ instituteId: institutedata._id });
//   institutedata.otp = "";
//   await institutedata.save();

//   res.status(200).json({
//     message: "login successfull",
//     token: jwt,
//   });
// });
module.exports = { registerinstitute };
