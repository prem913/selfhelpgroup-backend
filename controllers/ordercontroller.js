const Order = require("../models/ordermodel");
const shg = require("../models/shgmodel");
const asyncHandler = require("express-async-handler");
const itemsmodel = require("../models/itemsmodel");
const { sendEmail } = require("../utils/mail");
const { sendordernotification } = require("../utils/notification");
const createorder = asyncHandler(async (req, res) => {
  try {
    const orderdata = new Order();
    const items = req.body;
    if (Object.keys(items).length === 0) {
      return res.status(400).json({
        error: "Please provide items to update",
      });
    }
    const check = async () => {
      return new Promise((resolve, reject) => {
        items.forEach(async (item, index) => {
          if (!item.itemid || !item.itemquantity) {
            reject("Please provide all the details itemid and quantity");
          }
          const itemdata = await itemsmodel.findById(item.itemid);
          if (!itemdata) {
            reject("Item not found");
          }
          // if (itemtype === "loose" && !itemunit) {
          //   return res.status(400).json({
          //     error: "Please provide unit with quantity",
          //   });
          // }
          req.user.savedorders.forEach((savedorder, index) => {
            if (savedorder.itemid.toString() === item.itemid.toString()) {
              req.user.savedorders.splice(index, 1);
            }
          });

          if (index === items.length - 1) {
            resolve();
          }
        });
      });
    };
    check()
      .then(async () => {
        orderdata.institutename = req.user.name;
        orderdata.instituteid = req.user._id;
        orderdata.departmentid = req.user.departmentid;
        orderdata.department = req.user.department;
        orderdata.institutelocation = req.user.location;
        orderdata.status = "pending";
        await orderdata.save();

        // orderdata.items = itemdata;
        await items.forEach(async ({ itemid, itemquantity }) => {
          const item = await itemsmodel.findById(itemid);
          await Order.findByIdAndUpdate(orderdata._id, {
            $push: {
              items: {
                itemid: itemid,
                itemname: item.itemname,
                itemtype: item.itemtype,
                itemdescription: item.itemdescription,
                itemprice: item.itemprice,
                itemunit: item.itemunit,
                itemquantity: itemquantity,
              },
            },
          });
        });

        await req.user.save();
        res.json({
          message: "Order registered successfully",
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
      message: err,
    });
  }
});

const modifyorder = asyncHandler(async (req, res) => {
  try {
    const items = req.body;
    if (Object.keys(items).length === 0) {
      return res.status(400).json({
        error: "Please provide items to update",
      });
    }
    const orderdata = await Order.findById(req.params.id);
    if (!orderdata) {
      return res.status(400).json({
        error: "Order not found",
      });
    }
    if (orderdata.instituteid.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        error: "You are not authorized to update this order",
      });
    }
    if (orderdata.status === "pending") {
      const check = async () => {
        return new Promise((resolve, reject) => {
          items.forEach(async (item, index) => {
            if (!item.itemid || !item.itemquantity) {
              reject("Please provide all the details itemid and quantity");
            }
            const itemdata = await itemsmodel.findById(item.itemid);
            if (!itemdata) {
              reject("Item not found");
            }

            // if (itemtype === "loose" && !itemunit) {
            //   return res.status(400).json({
            //     error: "Please provide unit with quantity",
            //   });
            // }

            if (index === items.length - 1) {
              orderdata.items = [];
              await orderdata.save();
              resolve();
            }
          });
        });
      };
      check()
        .then(async () => {
          // orderdata.items = itemdata;
          await items.forEach(async ({ itemid, itemquantity }) => {
            const item = await itemsmodel.findById(itemid);
            if (!item) {
              return res.status(400).json({
                error: "Item not found",
              });
            }
            await Order.findByIdAndUpdate(orderdata._id, {
              $push: {
                items: {
                  itemid: itemid,
                  itemname: item.itemname,
                  itemtype: item.itemtype,
                  itemdescription: item.itemdescription,
                  itemprice: item.itemprice,
                  itemunit: item.itemunit,
                  itemquantity: itemquantity,
                },
              },
            });
          });
          res.json({
            message: "Order updated successfully",
          });
        })
        .catch((err) => {
          res.status(400).json({
            error: err,
          });
        });
    } else {
      return res.status(400).json({
        error: "Order already approved",
      });
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

const getallorders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({ status: "approved" });

    const orderdata = [];
    // orders.filter((order) => {
    //   req.user.products.forEach((product) => {
    //     if (order.itemname === product.name) {
    //       orderdata.push(order);
    //       return;
    //     }
    //   });
    // });
    orders.forEach((order) => {
      // const item = order.items.find((item) => {
      //   const product = req.user.products.find((product) => {
      //     return product.name === item.itemname;
      //   });
      //   return product;
      // });
      //for adding product based filter add item&&

      const date = new Date();
      const orderdate = new Date(order.createdAt);
      const diff = Math.abs(date - orderdate);
      const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
      if (diffDays > 2 && !JSON.stringify(order.bid).includes(req.user._id)) {
        orderdata.push(order);
      } else {
        if (
          order.institutelocation === req.user.location &&
          !JSON.stringify(order.bid).includes(req.user._id)
        ) {
          orderdata.push(order);
        }
      }
    });
    orderdata.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    // req.user.products.forEach((product) => {
    //   orders.forEach((order) => {
    //     order.items.forEach((item) => {
    //       if (item.itemname === product.name) {
    //         orderdata.push(order);
    //         return;
    //       }
    //     });
    //   });
    // });
    res.json({
      message: "Orders fetched successfully",
      orders: orderdata,
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

const getorderbydepartment = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({ departmentid: req.user._id });
    orders.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    orders.forEach((order) => {
      if (order.bid.length)
        order.bid.sort((a, b) => b.products.length - a.products.length);
    });
    res.json({
      message: "Orders fetched successfully",
      orders: orders,
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

const getorderbyinstitute = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({ instituteid: req.user._id });
    orders.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    res.json({
      message: "Orders fetched successfully",
      orders: orders,
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
const deleteorder = asyncHandler(async (req, res) => {
  try {
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
    if (order.status === "approved") {
      return res.status(400).json({
        error: "You cannot delete approved order",
      });
    }
    await Order.findByIdAndDelete(orderid);
    res.json({
      message: "Order deleted successfully",
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

const getallitems = asyncHandler(async (req, res) => {
  try {
    const items = await itemsmodel.find().select("-__v");
    res.status(200).json(items);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Internal server error!",
      error: err,
    });
  }
});

const additems = asyncHandler(async (req, res) => {
  try {
    const { itemtype, itemdescription, itemunit, itemname, itemprice } =
      req.body;
    const itemcheck = await itemsmodel.findOne({ itemname });
    if (itemcheck) {
      return res.status(400).json({
        error: "Item already exists",
      });
    }
    if (!itemname || !itemdescription || !itemtype || !itemprice) {
      res.status(400).json({
        message: "provide all details",
      });
      return;
    }
    if (itemtype === "loose" && !itemunit) {
      res.status(400).json({
        message: "provide unit with quantity for loose type products",
      });
      return;
    }
    const item = {
      itemtype,
      itemdescription,
      itemname,
      itemunit,
      itemprice,
    };
    const newitem = new itemsmodel(item);
    await newitem.save();

    res.status(200).json({
      message: "done",
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

const lockorder = asyncHandler(async (req, res) => {
  try {
    const { orderid } = req.body;
    if (!orderid) {
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
    if (order.instituteid.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        error: "You are not authorized to approve this order",
      });
    }
    if (order.status === "approved") {
      return res.status(400).json({
        error: "Order already approved",
      });
    }
    order.status = "approved";
    // sendEmail(
    //   order.email,
    //   order._id.toString(),
    //   order.status,
    //   order.department
    // );
    const shglocation = await shg.find({ location: req.user.location });
    shglocation.forEach((shg) => {
      if (shg.devicetoken) {
        sendordernotification(shg.devicetoken, req.user.name);
      }
    });
    await order.save();
    res.json({
      message: "Order approved for display",
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

const deleteitem = asyncHandler(async (req, res) => {
  try {
    const { orderid, itemid } = req.body;
    if (!itemid || !orderid) {
      return res.status(400).json({
        error: "Please provide itemid and orderid",
      });
    }
    const order = await Order.findById(orderid);
    if (!order) {
      return res.status(400).json({
        error: "No order found with this id",
      });
    }
    if (order.items.length === 1) {
      return res.status(400).json({
        error: "You cannot delete the only item in the order",
      });
    }
    if (order.status === "approved") {
      return res.status(400).json({
        error: "You cannot delete approved order",
      });
    }
    if (order.instituteid.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        error: "You are not authorized to delete this order",
      });
    }
    const item = order.items.find((item) => {
      return item._id.toString() === itemid.toString();
    });
    if (!item) {
      return res.status(400).json({
        error: "No item found with this id",
      });
    }
    order.items.pull(item);
    await order.save();
    res.json({
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
module.exports = {
  createorder,
  getallorders,
  getorderbydepartment,
  getorderbyinstitute,
  deleteorder,
  getallitems,
  additems,
  modifyorder,
  lockorder,
  deleteitem,
};
