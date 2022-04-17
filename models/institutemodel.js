const mongoose = require("mongoose");

const institutemodel = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
      enum: [
        "healthcare",
        "education",
        "tribal welfare",
        "social welfare",
        "women and child development",
      ],
    },
    departmentid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "department",
    },
    otp: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Institute", institutemodel);