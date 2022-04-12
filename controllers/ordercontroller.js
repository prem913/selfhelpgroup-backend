const departmentmodel = require("../models/departmentmodel");
const Order = require("../models/ordermodel");
const asyncHandler = require("express-async-handler");
const createorder = asyncHandler(async (req, res) => {
  const { itemtype, itemname, itemquantity, itemprice, itemdescription } =
    req.body;
  if (
    !itemtype ||
    !itemname ||
    !itemquantity ||
    !itemprice ||
    !itemdescription
  ) {
    return res.status(400).json({
      error:
        "Please provide all the details type name quantity price and description",
    });
  }
  const orderdata = req.body;
  orderdata.departmentid = req.user._id;
  orderdata.department = req.user.department;
  console.log(orderdata);
  const neworder = new Order(orderdata);
  await neworder.save();
  res.json({
    message: "Order registered successfully",
  });
});

const getallorders = asyncHandler(async (req, res) => {
  const orders = await Order.find();
  res.json({
    message: "Orders fetched successfully",
    orders: orders,
  });
});

const getorderbydepartment = asyncHandler(async (req, res) => {
  const orders = await Order.find({ departmentid: req.user._id });
  res.json({
    message: "Orders fetched successfully",
    orders: orders,
  });
});

module.exports = {
  createorder,
  getallorders,
  getorderbydepartment,
};
