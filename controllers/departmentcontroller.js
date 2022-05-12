const asynchandler = require("express-async-handler");
const departmentmodel = require("../models/departmentmodel");
const Order = require("../models/ordermodel");
const Institute = require("../models/institutemodel");
const shg = require("../models/shgmodel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/mail");
const { sendnotification } = require("../utils/notification");
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

  const shgfind = order.bid.find(
    (order) => order.shgId.toString() === shgId.toString()
  );
  if (!shgfind) {
    return res.status(400).json({
      error: "No shg found with this id",
    });
  }
  if (shgfind.status === "approved") {
    return res.status(400).json({
      error: "Bid already approved",
    });
  }
  order.items.forEach((item) => {
    shgfind.products.forEach((product) => {
      if (item.itemname === product.shgproduct) {
        item.approvedquantity = item.approvedquantity + product.quantity;
      }
    });
  });
  await Order.findByIdAndUpdate(orderid, {
    $push: {
      approvedbid: {
        shgId: shgId,
        shgname: shgfind.shgname,
        shgcontact: shgfind.shgcontact,
        shglocation: shgfind.shglocation,
        products: shgfind.products,
      },
    },
  });

  shgfind.status = "approved";
  const shgdata = await shg.findByIdAndUpdate(shgId, {
    $push: {
      orders: {
        orderid: orderid,
        department: req.user.department,
        institutename: order.institutename,
        institutelocation: order.institutelocation,
        products: shgfind.products,
      },
    },
  });
  await order.save();
  await shgdata.save();
  const shgfromshgmodel = await shg.findById(shgId);
  if (shgfromshgmodel.devicetoken) {
    sendnotification(
      shgfromshgmodel.devicetoken,
      order.institutename,
      order.department,
      order.status
    );
  }
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

const approvefordisplay = asynchandler(async (req, res) => {
  const { orderid, status } = req.body;
  if (!orderid || !status) {
    return res.status(400).json({
      error: "Please provide orderid and status",
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
  if (status === "approve") {
    order.status = "approved";
  } else if (status === "cancel") {
    order.status = "cancelled";
  }
  sendEmail(order.email, order._id.toString(), order.status, order.department);
  await order.save();
  res.json({
    message: "Order approved for display",
  });
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
    res.status(500).json({
      error: err.message,
    });
  }
});
module.exports = {
  registerdepartment,
  logindepartment,
  instituteunderdepartment,
  approveorder,
  getshgdata,
  approvefordisplay,
  profile,
};
