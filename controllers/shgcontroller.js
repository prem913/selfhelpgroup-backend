const shg = require("../models/shgmodel");
const Order = require("../models/ordermodel");
const asynchandler = require("express-async-handler");
const { generateOTP, sendotp } = require("../utils/otp");
const { createJwtToken } = require("../utils/token");

const registershg = asynchandler(async (req, res) => {
  console.log(req.body);
  const { name, contact, location } = req.body;
  if (!name || !contact || !location) {
    res.status(400).json({
      error: "Please provide all the details name contact and location",
    });
  }
  const shgdata = req.body;
  const newshg = new shg(shgdata);
  await newshg.save();
  res.json({
    message: "SHG registered successfully",
  });
});

const shglogin = asynchandler(async (req, res) => {
  const { contact } = req.body;
  const shgdata = await shg.findOne({ contact });
  if (!shgdata) {
    res.status(400).json({
      message: "SHG NOT FOUND",
    });
  }

  res.status(200).json({
    message: "success otp is sent to your mobile number",
    shgId: shgdata._id,
  });

  const otp = generateOTP();
  console.log(otp);
  shgdata.otp = otp;
  await shgdata.save();
  //message service sents otp here
  try {
    await sendotp(contact, otp);
  } catch (err) {
    console.log(err);
  }
});

const verifyOtp = asynchandler(async (req, res) => {
  const { shgId, otp } = req.body;
  const shgdata = await shg.findById(shgId);
  if (!shgdata) {
    res.status(400).json({
      message: "user not found",
    });
    return;
  }

  if (otp !== shgdata.otp) {
    res.status(400).json({
      message: "incorrect otp",
    });
    return;
  }
  const datenow = new Date().getTime();
  const update = new Date(shgdata.updatedAt).getTime();
  if (datenow - update > 30 * 60 * 1000) {
    res.status(400).json({
      message: "otp expired login again!",
    });
    return;
  }

  shgdata.otp = "";
  await shgdata.save();
  const token = createJwtToken({ shgId: shgdata._id });
  res.status(200).json({
    token,
    message: "successfully logged in",
  });
});

const addproducts = asynchandler(async (req, res) => {
  const { name, type, quantity, price, manufacturingdate, expirydate, unit } =
    req.body;
  const shgdata = await shg.findById(req.user._id);
  if (!name || !type || !quantity || !price) {
    return res.status(400).json({
      error: "Please provide all the details name type quantity price ",
    });
  }
  if (type === "loose" && !unit) {
    return res.status(400).json({
      error: "Please provide unit with quantity",
    });
  }
  if (type === "packed" && (!manufacturingdate || !expirydate)) {
    return res.status(400).json({
      error:
        "Please provide manufacturing date and expiry date for packed items",
    });
  }
  const productcheck = shgdata.products.find(
    (product) => product.name === name
  );
  if (productcheck) {
    return res.status(400).json({
      error: "product already exists",
    });
  }
  const data = {
    name,
    type,
    quantity,
    price,
  };
  if (type === "packed") {
    data.manufacturingdate = manufacturingdate;
    data.expirydate = expirydate;
  }
  if (type === "loose") {
    data.unit = unit;
  }
  shgdata.products.push(data);
  await shgdata.save();
  res.status(200).json({
    message: "product added successfully",
  });
});

const bid = asynchandler(async (req, res) => {
  const { orderid } = req.body;
  if (!orderid) {
    return res.status(400).json({
      error: "Please provide orderid",
    });
  }
  const order = await Order.findById(orderid);
  if (!order) {
    return res.status(400).json({
      error: "order not found",
    });
  }
  const shgdata = await shg.findById(req.user._id);
  const product = shgdata.products.find(
    (product) => product.name === order.itemname
  );
  const checkorder = order.bid.find(
    (bid) => toString(bid.shgId) === toString(shgdata._id)
  );
  if (checkorder) {
    return res.status(400).json({
      error: "you have already added product for this order",
    });
  }
  if (!product) {
    return res.status(400).json({
      error: "Please add product first",
    });
  }
  if (product.type !== order.itemtype) {
    return res.status(400).json({
      error: "product type does not match with order type",
    });
  }
  if (product.type === "loose" && product.unit !== order.itemunit) {
    return res.status(400).json({
      error: "product unit does not match with order unit",
    });
  }
  order.bid.push({
    shgId: shgdata._id,
    shgname: shgdata.name,
    shgcontact: shgdata.contact,
    shglocation: shgdata.location,
    shgproduct: product.name,
    quantity: product.quantity,
    price: product.price,
  });
  if (product.unit) {
    order.bid[order.bid.length - 1].unit = product.unit;
  }
  if (product.manufacturingdate) {
    order.bid[order.bid.length - 1].manufacturingdate =
      product.manufacturingdate;
  }
  if (product.expirydate) {
    order.bid[order.bid.length - 1].expirydate = product.expirydate;
  }
  await order.save();
  res.status(200).json({
    message: "product added successfully to order",
  });
});

const getproducts = asynchandler(async (req, res) => {
  const shgdata = await shg.findById(req.user._id);
  res.status(200).json({
    products: shgdata.products,
  });
});
module.exports = {
  registershg,
  shglogin,
  verifyOtp,
  addproducts,
  bid,
  getproducts,
};
