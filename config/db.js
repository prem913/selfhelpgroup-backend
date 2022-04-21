const mongoose = require("mongoose");
require("dotenv").config();
const dbconnect = () => {
  try {
    mongoose.connect(process.env.MONGO_URI, () => {
      console.log("MongoDB connected");
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = dbconnect;
