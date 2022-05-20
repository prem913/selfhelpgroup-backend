const shg = require("../models/shgmodel");
const Order = require("../models/ordermodel");
const asynchandler = require("express-async-handler");
const { generateOTP, sendotp } = require("../utils/otp");
const { createJwtToken } = require("../utils/token");

const registershg = asynchandler(async (req, res) => {
  try {
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
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      error: err,
    });
  }
});

const shglogin = asynchandler(async (req, res) => {
  try {
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
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      error: err,
    });
  }
});

const verifyOtp = asynchandler(async (req, res) => {
  try {
    const { shgId, otp, devicetoken } = req.body;
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
    // if (datenow - update > 30 * 60 * 1000) {
    //   res.status(400).json({
    //     message: "otp expired login again!",
    //   });
    //   return;
    // }
    if (devicetoken) {
      shgdata.devicetoken = devicetoken;
    }
    shgdata.otp = "";
    await shgdata.save();
    const token = createJwtToken({ shgId: shgdata._id }, { expiresIn: "30d" });
    res.status(200).json({
      token,
      message: "successfully logged in",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      error: err,
    });
  }
});

const addproducts = asynchandler(async (req, res) => {
  try {
    const { name, type, quantity, manufacturingdate, expirydate, unit } =
      req.body;
    const shgdata = await shg.findById(req.user._id);
    if (!name || !type || !quantity) {
      return res.status(400).json({
        error: "Please provide all the details name type quantity",
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
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      error: err,
    });
  }
});

const bid = asynchandler(async (req, res) => {
  try {
    const { orderid, product } = req.body;
    if (!orderid || !product) {
      return res.status(400).json({
        error: "Please provide product and orderid",
      });
    }
    const order = await Order.findById(orderid);
    const shgdata = await shg.findById(req.user._id);
    if (!order) {
      return res.status(400).json({
        error: "order not found",
      });
    }
    const biddata = order.bid.find((bid) => {
      return bid.shgId.toString() === req.user._id.toString();
    });
    if (biddata) {
      return res.status(400).json({
        error: "you have already bid for this order",
      });
    }
    const check = async () => {
      return new Promise((resolve, reject) => {
        product.forEach((item, index) => {
          if (!item.productid || !item.quantity || !item.unitprice) {
            reject("Please provide product name quantity and unitprice");
          }
          const orderproduct = order.items.find(
            (product) => product._id.toString() === item.productid
          );
          if (!orderproduct) {
            reject("order product not found");
          }
          const product = req.user.products.find(
            (product) => product.name === orderproduct.itemname
          );
          if (!product) {
            reject("Please add product first");
          }
          if (index === product.length - 1) {
            resolve();
          }
        });
      });
    };
    check()
      .then(async () => {
        const productsdata = [];
        product.forEach(async (item) => {
          const orderproduct = order.items.find(
            (product) => product._id.toString() === item.productid
          );
          const product = shgdata.products.find(
            (product) => product.name === orderproduct.itemname
          );
          if (product.type !== orderproduct.itemtype) {
            return res.status(400).json({
              error: "product type does not match with order type",
            });
          }
          if (
            product.type === "loose" &&
            product.unit !== orderproduct.itemunit
          ) {
            return res.status(400).json({
              error: "product unit does not match with order unit",
            });
          }
          const checkorder = order.bid.find(
            (bid) =>
              toString(bid.shgId) === toString(shgdata._id) &&
              bid.shgproduct === product.name
          );
          if (checkorder) {
            return res.status(400).json({
              error: "you have already added product for this order",
            });
          }
          productsdata.push({
            shgproduct: product.name,
            quantity: item.quantity,
            unitprice: item.unitprice,
            totalprice: item.quantity * item.unitprice,
          });
          if (product.unit) {
            productsdata[productsdata.length - 1].unit = product.unit;
          }
          if (product.manufacturingdate) {
            productsdata[productsdata.length - 1].manufacturingdate =
              product.manufacturingdate;
          }
          if (product.expirydate) {
            productsdata[productsdata.length - 1].expirydate =
              product.expirydate;
          }
        });
        // if (quantity > product.quantity) {
        //   return res.status(400).json({
        //     error: "You do not have this quantity in your inventory",
        //   });
        // }
        order.bid.push({
          shgId: shgdata._id,
          shgname: shgdata.name,
          shgcontact: shgdata.contact,
          shglocation: shgdata.location,
          products: productsdata,
          status: "pending",
        });
        await shgdata.save();
        await order.save();
        res.status(200).json({
          message: "products added successfully to order",
        });
      })
      .catch((err) => {
        res.status(400).json({
          error: err,
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      error: err,
    });
  }
});

const getproducts = asynchandler(async (req, res) => {
  try {
    const shgdata = await shg.findById(req.user._id);
    res.status(200).json({
      products: shgdata.products,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      error: err,
    });
  }
});

const updateproduct = asynchandler(async (req, res) => {
  try {
    const { productid } = req.body;
    if (!productid) {
      return res.status(400).json({
        error: "Please provide productid",
      });
    }
    const shgdata = await shg.findById(req.user._id);
    const product = shgdata.products.find(
      (product) => product._id.toString() === productid
    );
    if (!product) {
      return res.status(400).json({
        error: "product not found",
      });
    }
    const { quantity, unit, manufacturingdate, expirydate } = req.body;
    if (
      quantity === "" ||
      unit === "" ||
      manufacturingdate === "" ||
      expirydate === ""
    ) {
      return res.status(400).json({
        error: "You cannot update any field to empty",
      });
    }
    if (quantity) {
      product.quantity = quantity;
    }
    if (product.type === "loose" && unit) {
      product.unit = unit;
    }
    if (product.type === "packed" && manufacturingdate) {
      product.manufacturingdate = manufacturingdate;
    }
    if (product.type === "packed" && expirydate) {
      product.expirydate = expirydate;
    }
    await shgdata.save();
    res.status(200).json({
      message: "product updated successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      error: err,
    });
  }
});
const deleteproduct = asynchandler(async (req, res) => {
  try {
    const { productid } = req.body;
    if (!productid) {
      return res.status(400).json({
        error: "Please provide productid",
      });
    }
    const shgdata = await shg.findById(req.user._id);
    const product = shgdata.products.find(
      (product) => product._id.toString() === productid
    );
    if (!product) {
      return res.status(400).json({
        error: "product not found",
      });
    }
    shgdata.products = shgdata.products.filter(
      (product) => product._id.toString() !== productid
    );
    await shgdata.save();
    res.status(200).json({
      message: "product deleted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      error: err,
    });
  }
});

const getapprovedproducts = asynchandler(async (req, res) => {
  try {
    const shgdata = await shg.findById(req.user._id);
    shgdata.orders.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    res.status(200).json({
      products: shgdata.orders,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      error: err,
    });
  }
});

const getprofile = asynchandler(async (req, res) => {
  try {
    const shgdata = await shg.findById(req.user._id);
    res.status(200).json({
      name: shgdata.name,
      contact: shgdata.contact,
      location: shgdata.location,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      error: err,
    });
  }
});
module.exports = {
  registershg,
  shglogin,
  verifyOtp,
  addproducts,
  bid,
  getproducts,
  updateproduct,
  deleteproduct,
  getapprovedproducts,
  getprofile,
};
