const Institute = require("../models/institutemodel");
const departmentmodel = require("../models/departmentmodel");
const asyncHandler = require("express-async-handler");
const { createJwtToken } = require("../utils/token");
const bcrypt = require("bcryptjs");
const Order = require("../models/ordermodel");
const shg = require("../models/shgmodel");
const { sendnotification, senddeliverynotification } = require("../utils/notification");
const itemsmodel = require("../models/itemsmodel");
const Zone = require("../models/zonemodel");
const registerinstitute = asyncHandler(async (req, res) => {
  try {
    const { name, location, contact, department, email, password, username } = req.body;
    if (!name || !location || !contact || !department || !password) {
      return res.status(400).json({
        error:
          "Please provide all the required fields name location contact department and password",
      });
    }
    if (contact.length != 10) {
      return res.status(400).json({
        error:
          "Please provide a valid contact number",
      });
    }
    if (!username && !email) {
      return res.status(400).json({
        error:
          "Please provide username or email",
      });
    }
    if (email) {
      const isregistered = await Institute.findOne({ email });
      if (isregistered) {
        res.json({
          success: false,
          message: "email is already registered",
        });
        return;
      }
    }
    const check = await Institute.findOne({ username });
    if (check) {
      res.json({
        success: false,
        message: "username is already registered",
      });
      return;
    }
    const check2 = await Institute.findOne({ contact });
    if (check2) {
      res.json({
        success: false,
        message: "contact is already registered",
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
    const zone = await Zone.findOne({ zonename: location });
    if (!zone) {
      res.json({
        message: "zone not found",
      });
      return;
    }
    if (!zone.institutes) {
      zone.institutes = [];
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
      username,
      password: hashedPassword,
      zoneid: zone._id,
      zonename: zone.zonename,
    });
    await institute.save();
    zone.institutes.push({
      instituteid: institute._id,
      institutename: name,
    });
    await zone.save();
    res.status(200).json({
      success: true,
      data: institute,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      message: err.message,
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
    const check = async () => {
      return new Promise((resolve, reject) => {
        shgfind.products.forEach((product, index2) => {
          products.forEach((item, index) => {
            const orderitem = order.items.find(
              (order) => order.itemname === product.shgproduct
            );
            if (!orderitem) {
              reject("Item not found in order");
            }
            if (orderitem.approvedquantity + item.quantity > orderitem.itemquantity) {
              reject("Quantity exceeded");
            }
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
            if (index === products.length - 1 && index2 === shgfind.products.length - 1) {
              if (selectedproducts.length !== products.length) {
                reject("Product is not present in order");
              }
              resolve();
            }
          });
        });
      });
    };
    check()
      .then(async () => {

        order.items.forEach((item) => {
          shgfind.products.forEach((product) => {
            products.forEach((product1) => {
              if (product._id.toString() === product1.productid.toString() && item.itemname === product.shgproduct) {
                item.approvedquantity = item.approvedquantity + product1.quantity;
              }
            });
          });
        });

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
        const total = selectedproducts.reduce((acc, curr) => {
          return acc + curr.totalprice;
        }, 0);
        const shgdata = await shg.findByIdAndUpdate(shgId, {
          $push: {
            orders: {
              orderid: orderid,
              department: req.user.department,
              institutename: order.institutename,
              institutelocation: order.institutelocation,
              products: selectedproducts,
              totalamount: total,
            },
          },
        });
        let completed = false;
        order.items.forEach((item) => {
          if (item.approvedquantity === item.itemquantity) {
            completed = true;
          } else {
            completed = false;
          }
        });
        if (completed) {
          order.status = "completed";
        }
        await order.save();
        await shgdata.save();
        const shgfromshgmodel = await shg.findById(shgId);
        if (shgfromshgmodel.devicetoken) {
          sendnotification(
            shgfromshgmodel.devicetoken,
            order.institutename,
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
      message: err.message,
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
          if (!item.itemid || !item.itemquantity || !item.itemname || !item.itemtype || !item.itemunit) {
            reject("Please provide all the details itemid and quantity name type and unit");
          }
          if (index === items.length - 1) {
            resolve();
          }
        });
      });
    };
    check()
      .then(async () => {
        req.user.savedorders = [];
        items.forEach(async (item) => {
          req.user.savedorders.push({
            itemid: item.itemid,
            itemname: item.itemname,
            itemquantity: item.itemquantity,
            itemtype: item.itemtype,
            itemunit: item.itemunit,
            itemdescription: item.itemdescription,
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
      message: err.message,
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
      message: err.message,
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
      message: err.message,
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
        order.bid.map((approvedbid) => {
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
      order.approvedbid.forEach((bid) => {
        if (bid.shgId.toString() === approvedbid.shgId.toString()) {
          bid.deliveryverified = true;
        }
      });
      const shgdata = await shg.findById(approvedbid.shgId);
      shgdata.orders.forEach((order) => {
        if (order.orderid.toString() === orderid.toString()) {
          order.deliveryverified = true;
          const today = new Date();
          const month = today.getMonth();
          if (month === 0) {
            shgdata.january += order.totalamount;
          } else if (month === 1) {
            shgdata.february += order.totalamount;
          }
          else if (month === 2) {
            shgdata.march += order.totalamount;
          }
          else if (month === 3) {
            shgdata.april += order.totalamount;
          }
          else if (month === 4) {
            shgdata.may += order.totalamount;
          }
          else if (month === 5) {
            shgdata.june += order.totalamount;
          }
          else if (month === 6) {
            shgdata.july += order.totalamount;
          }
          else if (month === 7) {
            shgdata.august += order.totalamount;
          }
          else if (month === 8) {
            shgdata.september += order.totalamount;
          }
          else if (month === 9) {
            shgdata.october += order.totalamount;
          }
          else if (month === 10) {
            shgdata.november += order.totalamount;
          }
          else if (month === 11) {
            shgdata.december += order.totalamount;
          }
        }
      });
      if (shgdata.devicetoken) {
        senddeliverynotification(shgdata.devicetoken, req.user.name);
      }

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
      message: err.message,
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
