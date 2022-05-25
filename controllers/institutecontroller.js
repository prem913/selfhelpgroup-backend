const Institute = require("../models/institutemodel");
const departmentmodel = require("../models/departmentmodel");
const asyncHandler = require("express-async-handler");
const { createJwtToken } = require("../utils/token");
const bcrypt = require("bcryptjs");
const Order = require("../models/ordermodel");
const shg = require("../models/shgmodel");
const { sendnotification } = require("../utils/notification");
const itemsmodel = require("../models/itemsmodel");
const registerinstitute = asyncHandler(async (req, res) => {
  try {
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
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      error: err,
    });
  }
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
  try {
    const { orderid, shgId, products } = req.body;
    const selectedproducts = [];
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
        products.forEach((product1) => {
          if (product._id.toString() === product1.productid.toString() && item.itemname === product.shgproduct) {
            item.approvedquantity = item.approvedquantity + product1.quantity;
          }
        });
      });
    });
    const check = async () => {
      return new Promise((resolve, reject) => {
        shgfind.products.forEach((product) => {
          products.forEach((item, index) => {
            if (product._id.toString() === item.productid.toString() && item.quantity > product.quantity) {
              reject("quantiy is greater than quantity in bid");
            }
            if (product._id.toString() === item.productid.toString()) {
              selectedproducts.push({
                shgproduct: product.shgproduct,
                quantity: item.quantity,
                unit: product.unit,
                unitprice: product.unitprice,
                totalprice: item.quantity * product.unitprice,
              });
            }
            if (selectedproducts.length !== products.length) {
              reject("Product is not present in order");
            }
            if (index === products.length - 1) {
              resolve();
            }
          });
        });
      });
    };
    check()
      .then(async () => {
        await Order.findByIdAndUpdate(orderid, {
          $push: {
            approvedbid: {
              shgId: shgId,
              shgname: shgfind.shgname,
              shgcontact: shgfind.shgcontact,
              shglocation: shgfind.shglocation,
              products: selectedproducts,
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
              products: selectedproducts,
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

const saveorder = asyncHandler(async (req, res) => {
  try {
    const items = req.body;
    if (Object.keys(items).length === 0) {
      return res.status(400).json({
        error: "Please provide items to save",
      });
    }
    const check = async () => {
      return new Promise((resolve, reject) => {
        items.forEach(async (item, index) => {
          if (!item.itemid || !item.itemquantity) {
            reject("Please provide all the details itemid and quantity");
          }
          req.user.savedorders.forEach((savedorder) => {
            if (savedorder.itemid.toString() === item.itemid.toString()) {
              reject("Item already saved");
            }
          });
          const itemdata = await itemsmodel.findById(item.itemid);
          item.itemname = itemdata.itemname;
          item.itemtype = itemdata.itemtype;
          item.itemunit = itemdata.itemunit;
          item.itemprice = itemdata.itemprice;
          if (!itemdata) {
            reject("Item not found");
          }
          if (index === items.length - 1) {
            resolve();
          }
        });
      });
    };
    check()
      .then(async () => {
        items.forEach(async (item) => {
          req.user.savedorders.push({
            itemid: item.itemid,
            itemname: item.itemname,
            itemquantity: item.itemquantity,
            itemtype: item.itemtype,
            itemunit: item.itemunit,
            itemdescription: item.itemdescription,
            itemprice: item.itemprice,
          });
        });
        await req.user.save();
        res.status(200).json({
          message: "Items saved successfully",
        });
      })
      .catch((err) => {
        return res.status(400).json({
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

const getsavedorder = asyncHandler(async (req, res) => {
  try {
    const savedorders = req.user.savedorders;
    if (savedorders.length === 0) {
      return res.status(400).json({
        error: "No saved orders found",
      });
    }
    return res.status(200).json({
      message: "Saved orders found",
      savedorders: [
        ...savedorders.map((item) => {
          return {
            _id: item.itemid,
            itemname: item.itemname,
            itemquantity: item.itemquantity,
            itemtype: item.itemtype,
            itemunit: item.itemunit,
            itemdescription: item.itemdescription,
            itemprice: item.itemprice,
          };
        }),
      ],
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

const deletesavedorder = asyncHandler(async (req, res) => {
  try {
    const { itemid } = req.body;
    if (!itemid) {
      return res.status(400).json({
        error: "Please provide itemid",
      });
    }
    const item = req.user.savedorders.find(
      (item) => item.itemid.toString() === itemid
    );
    if (!item) {
      return res.status(400).json({
        error: "No item found with this id",
      });
    }
    req.user.savedorders = req.user.savedorders.filter(
      (item) => item.itemid.toString() !== itemid
    );
    await req.user.save();
    res.status(200).json({
      message: "Item deleted successfully",
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

const verifydelivery = asyncHandler(async (req, res) => {
  try {
    const { orderid, approvedbidid } = req.body;
    if (!orderid || !approvedbidid) {
      return res.status(400).json({
        error: "Please provide orderid and approvedbidid",
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
        error: "You are not authorized to verify this order",
      });
    }
    const findbid = () => {
      return new Promise((resolve, reject) => {
        order.approvedbid.map((approvedbid) => {
          if (approvedbid._id.toString() === approvedbidid.toString()) {
            resolve(approvedbid);
          }
        });
        reject("No bid found with this id");
      });
    }
    findbid().then(async (approvedbid) => {
      if (approvedbid.delivered === false) {
        return res.status(400).json({
          error: "This order is not yet delivered",
        });
      }
      if (approvedbid.deliveryverified === true) {
        return res.status(400).json({
          error: "This order is already verified",
        });
      }
      approvedbid.deliveryverified = true;
      const shgdata = await shg.findById(approvedbid.shgId);
      shgdata.orders.forEach((order) => {
        if (JSON.stringify(order.products) === JSON.stringify(approvedbid.products)) {
          order.deliveryverified = true;
        }
      });
      await shgdata.save();
      await order.save();
      return res.status(200).json({
        message: "Order verified successfully",
      });
    }).catch((err) => {
      return res.status(400).json({
        success: false,
        error: err,
      });
    });
  }
  catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      error: err,
    });
  }
});
module.exports = {
  registerinstitute,
  approveorder,
  saveorder,
  getsavedorder,
  deletesavedorder,
  verifydelivery,
};
