const asynchandler = require("express-async-handler");
const departmentmodel = require("../models/departmentmodel");
const Order = require("../models/ordermodel");
const Institute = require("../models/institutemodel");
const shg = require("../models/shgmodel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const registerdepartment = asynchandler(async (req, res) => {
  try {
    const { department, contact, email, password } = req.body;
    if (!department || !contact || !email || !password) {
      res.status(400).json({
        error:
          "Please provide all the details department contact email and password",
      });
    }
    const checkdepartment = await departmentmodel.findOne({ department });
    if (checkdepartment) {
      return res.status(400).json({
        error: "Department already exists",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const departmentdata = req.body;
    departmentdata.password = hashedPassword;
    const newdepartment = new departmentmodel(departmentdata);
    await newdepartment.save();
    res.json({
      message: "Department registered successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      error: err,
    });
  }
});

const logindepartment = asynchandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        error: "Please provide all the details email and password",
      });
    }
    const department = await departmentmodel.findOne({ email });
    if (!department) {
      const institute = await Institute.findOne({ email });
      if (!institute) {
        return res.status(400).json({
          error: "No account registered with this email",
        });
      }
      const isMatch = await bcrypt.compare(password, institute.password);
      if (!isMatch) {
        return res.status(400).json({
          error: "Incorrect password",
        });
      }
      const token = jwt.sign(
        {
          instituteId: institute._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "30d",
        }
      );
      return res.json({
        message: "Login successful",
        token: token,
        usertype: "institute",
        department: institute.department,
      });
    }
    const isMatch = await bcrypt.compare(password, department.password);
    if (!isMatch) {
      return res.status(400).json({
        error: "Incorrect password",
      });
    }
    const token = jwt.sign(
      {
        id: department._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
    res.json({
      message: "Login successful",
      token: token,
      usertype: department.usertype,
      department: department.department,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      error: err,
    });
  }
});

const instituteunderdepartment = asynchandler(async (req, res) => {
  try {
    const { department } = req.user;
    if (!department) {
      return res.status(400).json({
        error: "Please provide department",
      });
    }
    const institute = await Institute.find({ department });
    res.json({
      message: "Institutes under this department",
      data: institute,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      error: err,
    });
  }
});

const getshgdata = asynchandler(async (req, res) => {
  try {
    if (req.user.department !== "ceo") {
      return res.status(400).json({
        error: "You are not authorized to view this data",
      });
    }
    const shgdata = await shg.find({});
    res.json({
      message: "SHG data",
      data: shgdata,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      error: err,
    });
  }
});

const profile = asynchandler(async (req, res) => {
  try {
    if (req.institute) {
      const institute = await Institute.findById(req.institute._id).select(
        "-password"
      );
      res.json({
        message: "Institute profile",
        data: institute,
      });
    }
    if (req.department) {
      const department = await departmentmodel
        .findById(req.department._id)
        .select("-password");
      res.json({
        message: "Department profile",
        data: department,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      error: err,
    });
  }
});
module.exports = {
  registerdepartment,
  logindepartment,
  instituteunderdepartment,
  getshgdata,
  profile,
};
