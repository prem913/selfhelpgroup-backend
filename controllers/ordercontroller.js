const Order = require("../models/ordermodel");
const shg = require("../models/shgmodel");
const asyncHandler = require("express-async-handler");
const itemsmodel = require("../models/itemsmodel");
const createorder = asyncHandler(async (req, res) => {
  try {
    const orderdata = new Order();
    console.log(req.body);
    const items = req.body;
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
    console.log(err);
  }
});

const getallorders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ status: "approved" });
  orders.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
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
    if (item) {
      orderdata.push(order);
    }
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
//To be completed
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
  res.json({
    message: "Order deleted successfully",
  });
  order.bid.map((bid) => {
    console.log(bid);
  });
  // await order.remove();
});

const getallitems = asyncHandler(async (req, res) => {
  const items = await itemsmodel.find().select("-__v");
  res.status(200).json(items);
});

const additems = asyncHandler(async (req, res) => {
  const { itemtype, itemdescription, itemunit, itemname, itemprice } = req.body;

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

module.exports = {
  createorder,
  getallorders,
  getorderbydepartment,
  getorderbyinstitute,
  deleteorder,
  getallitems,
  additems,
};
