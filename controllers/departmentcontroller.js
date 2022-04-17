const asynchandler = require("express-async-handler");
const departmentmodel = require("../models/departmentmodel");
const Order = require("../models/ordermodel");
const Institute = require("../models/institutemodel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const registerdepartment = asynchandler(async (req, res) => {
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
});

const logindepartment = asynchandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      error: "Please provide all the details email and password",
    });
  }
  const department = await departmentmodel.findOne({ email });
  if (!department) {
    res.status(400).json({
      error: "No department found with this email",
    });
  }
  const isMatch = await bcrypt.compare(password, department.password);
  if (!isMatch) {
    res.status(400).json({
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
  });
});

const instituteunderdepartment = asynchandler(async (req, res) => {
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
});

const approveorder = asynchandler(async (req, res) => {
  const { orderid, shgId } = req.body;
  if (!orderid || !shgId) {
    return res.status(400).json({
      error: "Please provide orderid and shgId",
    });
  }
  const order = await Order.findById(orderid);
  if (!order) {
    return res.status(400).json({
      error: "No order found with this id",
    });
  }
  let shg = null;
  shg = order.bid.map((order) => {
    if (order.shgId == shgId) {
      return order;
    }
  });
  if (shg === undefined) {
    return res.status(400).json({
      error: "No shg found with this id",
    });
  }
  console.log(shg);
  order.status = "pending";
  await order.save();
  res.json({
    message: "Order approved successfully",
  });
});

module.exports = {
  registerdepartment,
  logindepartment,
  instituteunderdepartment,
  approveorder,
};