const asynchandler = require("express-async-handler");
const ordermodel = require("../models/ordermodel");
const departmentmodel = require("../models/departmentmodel");
const { default: mongoose } = require("mongoose");
const getOrderbyId = asynchandler(async (req, res) => {
  try {
    const { orderId } = req.body;
    const orderdata = await ordermodel.findById(orderId);
    if (!orderdata) {
      res.status(400).json({
        success: false,
        message: "No order found by the given id!",
      });
      return;
    }
    res.json({
      ...orderdata._doc,
      success: true,
      message: "Order fetched successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error!",
      error: err,
    });
    console.log(err);
  }
});

const getOrdersbyDepartment = asynchandler(async (req, res) => {
  try {
    const { departmentId } = req.body;
    if (!departmentId) {
      res.status(400).json({
        message: "Please provide department id",
      });
      return;
    }
    const orders = await ordermodel
      .find({ departmentid: departmentId })
      .select("-departmentid");
    if (!orders) {
      res.status(400).json({
        message: "No order found in given department",
        success: false,
      });
    }
    res.json({
      totalOrders: orders.length,
      orders,
      success: true,
      message: "Orders fetched successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error!",
      error: err,
    });
    console.log(err);
  }
});

const getDepartments = asynchandler(async (req, res) => {
  try {
    const departments = await departmentmodel.find({}).select("department _id");
    if (!departments) {
      res.status(400).json({
        message: "No departments found",
        success: false,
      });
    }
    const departmentdata = departments.filter((department) => {
      if (department.department !== "ceo") {
        return {
          department: department.department,
          departmentId: department._id,
        };
      }
    });
    res.json({
      departmentdata,
      success: true,
      message: "Departments fetched successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error!",
      error: err,
    });
    console.log(err);
  }
});

const changeBidPrice = asynchandler(async (req,res)=>{
  const {bidid,productid,unitprice} = req.body;
  if(!bidid || !productid || !unitprice){
    res.status(400).json({
      success:false,
      message: "please provide all details"
    })
    return;
  }
  const order = await ordermodel.findOne({"approvedbid._id":bidid});
  if(!order) {
    res.status(400).json({
      success: false,
      message: "No bid is found with the given bidid"
    })
    return;
  }
  order.approvedbid.forEach(bid => {
    if(bid._id.equals(bidid)){
      bid.products.forEach(product=>{
        if(product._id.equals(productid)){
          product.unitprice = unitprice;
          product.totalprice = product.quantity * unitprice;
        }
      })
    }
  });

  await order.save();
  res.json({
    success: true,
    order
  });
});

module.exports = { getOrderbyId, getOrdersbyDepartment, getDepartments,changeBidPrice };
