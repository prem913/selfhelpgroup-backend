const asynchandler = require("express-async-handler");
const departmentmodel = require("../models/departmentmodel");
const Order = require("../models/ordermodel");
const Institute = require("../models/institutemodel");
const shg = require("../models/shgmodel");
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
  if (order.department !== req.user.department) {
    return res.status(400).json({
      error: "You are not authorized to approve this order",
    });
  }
  if (order.status === "approved") {
    return res.status(400).json({
      error: "Order already approved",
    });
  }
  const shgfind = order.bid.find((order) => order.shgId.toString() === shgId);
  if (!shgfind) {
    return res.status(400).json({
      error: "No shg found with this id",
    });
  }
  shgfind.approved = true;
  const shgdata = await shg.findById(shgId);
  const shgproduct = shgdata.products.find(
    (product) => product.name == order.itemname
  );
  if (shgproduct.orderstatus === "approved") {
    return res.status(400).json({
      error: "SHG product already approved",
    });
  }
  shgproduct.orderstatus = "approved";
  order.status = "approved";
  await order.save();
  await shgdata.save();
  res.json({
    message: "Order approved successfully",
  });
});

const getshgdata = asynchandler(async (req, res) => {
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
});

module.exports = {
  registerdepartment,
  logindepartment,
  instituteunderdepartment,
  approveorder,
  getshgdata,
};
