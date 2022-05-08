const asynchandler = require("express-async-handler");
const ordermodel = require("../models/ordermodel");
const getOrderbyId = asynchandler(async(req,res)=>{
    const {orderId} = req.body;
    const orderdata= await ordermodel.findById(orderId);
    if(!orderdata){
        res.status(400).json({
            success:false,
            message:"No order found by the given id!"
        });
        return;
    }
    res.json({
        ...orderdata._doc,
        success:true,
        message:"Order fetched successfully"
    });
    
});

const getOrdersbyDepartment = asynchandler(async(req,res)=>{
    const {departmentId} = req.body;
    if(!departmentId){
        res.status(400).json({
            message:"Please provide department id"
        });
        return;
    }
    const orders = await ordermodel.find({departmentid:departmentId}).select("-departmentid");
    if(!orders){
        res.status(400).json({
            message:"No order found in given department",
            success:false
        })
    }
    res.json({
        totalOrders:orders.length,
        orders,
        success:true,
        message:"Orders fetched successfully"
    })
})

module.exports ={getOrderbyId,getOrdersbyDepartment};