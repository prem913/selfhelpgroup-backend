const Order = require("../models/ordermodel");
const shg = require("../models/shgmodel");
const asyncHandler = require("express-async-handler");
const createorder = asyncHandler(async (req, res) => {
  const items = req.body;
  items.map(( {
    itemtype,
    itemname,
    itemquantity,
    itemprice,
    itemdescription,
    itemunit,
  }) =>{
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
  }});
  const orderdata = req.body;
  orderdata.institutename = req.user.name;
  orderdata.instituteid = req.user._id;
  orderdata.departmentid = req.user.departmentid;
  orderdata.department = req.user.department;
  orderdata.institutelocation = req.user.location;
  orderdata.status = "pending";
  orderdata.items=items;
  const neworder = new Order(orderdata);
  await neworder.save();
  res.json({
    message: "Order registered successfully",
  });
});

const getallorders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ approvedfordisplay: true });
  const orderdata = [];
  orders.filter((order) => {
    req.user.products.forEach((product) => {
      if (order.itemname === product.name) {
        orderdata.push(order);
        return;
      }
    });
  });
  res.json({
    message: "Orders fetched successfully",
    orders: orderdata,
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
//To be completed
const deleteorder = asyncHandler(async (req, res) => {
  const { orderid } = req.body;
  if (!orderid) {
    return res.status(400).json({
      error: "Please provide orderid",
    });
  }
  const order = await Order.findById(orderid);
  if (!order) {
    return res.status(400).json({
      error: "No order found with this id",
    });
  }
  if (order.instituteid.toString() !== req.user._id.toString()) {
    return res.status(400).json({
      error: "You are not authorized to delete this order",
    });
  }
  res.json({
    message: "Order deleted successfully",
  });
  order.bid.map((bid) => {
    console.log(bid);
  });
  // await order.remove();
});

module.exports = {
  createorder,
  getallorders,
  getorderbydepartment,
  getorderbyinstitute,
  deleteorder,
};
