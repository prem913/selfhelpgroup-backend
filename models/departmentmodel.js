const mongoose = require("mongoose");

const departmentmodel = mongoose.Schema(
  {
    department: {
      type: String,
      required: true,
      enum: [
        "healthcare",
        "education",
        "tribal welfare",
        "social welfare",
        "women and child development",
        "ceo",
      ],
    },
    usertype: {
      type: String,
      required: true,
      enum: ["department", "ceo"],
      default: "department",
    },
    contact: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("departmentmodel", departmentmodel);
//type of products list
// packed item and loose items
//list of packed items and loose items
//add quantity of
// date time quantity of order in print format
