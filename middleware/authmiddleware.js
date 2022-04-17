const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const departmentmodel = require("../models/departmentmodel");
const shg = require("../models/shgmodel");
const Institute = require("../models/institutemodel");
const protectdepartment = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      //Get Token from header
      token = req.headers.authorization.split(" ")[1];
      //Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //Get user from token
      req.user = await departmentmodel.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error("Not Authorized");
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("Not Authorized, No Token");
  }
});

const protectshg = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      //Get Token from header
      token = req.headers.authorization.split(" ")[1];
      //Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //Get user from token
      req.user = await shg.findById(decoded.shgId).select("-otp");
      if (!req.user) {
        res.status(401);
        throw new Error("Not Authorized");
      }
      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error("Not Authorized");
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("Not Authorized, No Token");
  }
});

const protectinstitute = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      //Get Token from header
      token = req.headers.authorization.split(" ")[1];
      //Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //Get user from token
      req.user = await Institute.findById(decoded.instituteId).select("-otp");
      if (!req.user) {
        res.status(401);
        throw new Error("Not Authorized");
      }
      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error("Not Authorized");
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("Not Authorized, No Token");
  }
});

module.exports = { protectdepartment, protectshg, protectinstitute };
