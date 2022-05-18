const Institute = require("../models/institutemodel");
const departmentmodel = require("../models/departmentmodel");
const asyncHandler = require("express-async-handler");
const { createJwtToken } = require("../utils/token");
const bcrypt = require("bcryptjs");
const Order = require("../models/ordermodel");
const shg = require("../models/shgmodel");
const { sendnotification } = require("../utils/notification");
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

const approveorder = asyncHandler(async (req, res) => {
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
  if (order.instituteid.toString() !== req.user._id.toString()) {
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

module.exports = { registerinstitute, approveorder };
