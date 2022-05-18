const Order = require("../models/ordermodel");
const shg = require("../models/shgmodel");
const asyncHandler = require("express-async-handler");
const itemsmodel = require("../models/itemsmodel");
const { sendEmail } = require("../utils/mail");
const createorder = asyncHandler(async (req, res) => {
  try {
    const orderdata = new Order();
    const items = req.body;
    if (Object.keys(items).length === 0) {
      return res.status(400).json({
        error: "Please provide items to update",
      });
    }
    items.forEach((item) => {
      if (!item.itemid && !item.itemquantity) {
        return res.status(400).json({
          error: "Please provide all the details itemid and quantity",
        });
      }
      // if (itemtype === "loose" && !itemunit) {
      //   return res.status(400).json({
      //     error: "Please provide unit with quantity",
      //   });
      // }
    });
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
      message: "Order registered successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
    console.log(err);
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
    const filtereditemdata = [];
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
            let check = false;
            orderdata.items.forEach(async (orderitem, index1) => {
              if (orderitem.itemid.toString() === item.itemid.toString()) {
                if (item.itemquantity !== orderitem.itemquantity) {
                  check = true;
                  orderdata.items[index1].itemquantity = item.itemquantity;
                  await orderdata.save();
                }
              }
            });
            if (check === false) {
              filtereditemdata.push(item);
            }
            // if (itemtype === "loose" && !itemunit) {
            //   return res.status(400).json({
            //     error: "Please provide unit with quantity",
            //   });
            // }

            if (index === items.length - 1) {
              resolve();
            }
          });
        });
      };
      check()
        .then(async () => {
          // orderdata.items = itemdata;
          await filtereditemdata.forEach(async ({ itemid, itemquantity }) => {
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
    res.status(500).json({
      error: err.message,
    });
    console.log(err);
  }
});

const getallorders = asyncHandler(async (req, res) => {
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
    const item = order.items.find((item) => {
      const product = req.user.products.find((product) => {
        return product.name === item.itemname;
      });
      return product;
    });
    if (item && order.institutelocation === req.user.location) {
      orderdata.push(order);
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
});

const getorderbydepartment = asyncHandler(async (req, res) => {
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
});

const getorderbyinstitute = asyncHandler(async (req, res) => {
  const orders = await Order.find({ instituteid: req.user._id });
  orders.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  res.json({
    message: "Orders fetched successfully",
    orders: orders,
  });
});
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
  if (order.status === "approved") {
    return res.status(400).json({
      error: "You cannot delete approved order",
    });
  }
  await Order.findByIdAndDelete(orderid);
  res.json({
    message: "Order deleted successfully",
  });
});

const getallitems = asyncHandler(async (req, res) => {
  const items = await itemsmodel.find().select("-__v");
  res.status(200).json(items);
});

const additems = asyncHandler(async (req, res) => {
  const { itemtype, itemdescription, itemunit, itemname, itemprice } = req.body;
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
});

const lockorder = asyncHandler(async (req, res) => {
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
  sendEmail(order.email, order._id.toString(), order.status, order.department);
  await order.save();
  res.json({
    message: "Order approved for display",
  });
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
};
