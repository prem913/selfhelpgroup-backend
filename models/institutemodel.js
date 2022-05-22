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
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    savedorders: [
      {
        type: new mongoose.Schema(
          {
            itemid: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Item",
            },
            itemname: {
              type: String,
            },
            itemquantity: {
              type: Number,
            },
            itemtype: {
              type: String,
            },
            itemunit: {
              type: String,
            },
            itemdescription: {
              type: String,
            },
            itemprice: {
              type: Number,
            },
          },
          { _id: false }
        ),
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Institute", institutemodel);
