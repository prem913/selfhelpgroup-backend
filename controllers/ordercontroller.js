const Order = require("../models/ordermodel");
const asyncHandler = require("express-async-handler");
const createorder = asyncHandler(async (req, res) => {
  const {
    itemtype,
    itemname,
    itemquantity,
    itemprice,
    itemdescription,
    itemunit,
  } = req.body;
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
  if (itemtype === "loose" && !itemunit) {
    return res.status(400).json({
      error: "Please provide unit with quantity",
    });
  }
  const orderdata = req.body;
  orderdata.institutename = req.user.name;
  orderdata.instituteid = req.user._id;
  orderdata.departmentid = req.user.departmentid;
  orderdata.department = req.user.department;
  orderdata.institutelocation = req.user.location;
  orderdata.status = "pending";
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

const getorderbyinstitute = asyncHandler(async (req, res) => {
  const orders = await Order.find({ instituteid: req.user._id });
  res.json({
    message: "Orders fetched successfully",
    orders: orders,
  });
});

module.exports = {
  createorder,
  getallorders,
  getorderbydepartment,
  getorderbyinstitute,
};
