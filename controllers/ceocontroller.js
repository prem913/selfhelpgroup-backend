const asynchandler = require("express-async-handler");
const ordermodel = require("../models/ordermodel");
const departmentmodel = require("../models/departmentmodel");
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

module.exports = { getOrderbyId, getOrdersbyDepartment, getDepartments };
