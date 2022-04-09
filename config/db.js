const mongoose = require("mongoose");
require("dotenv").config();
const dbconnect = () => {
  mongoose.connect(process.env.MONGO_URI, () => {
    console.log("MongoDB connected");
  });
};

module.exports = dbconnect;
