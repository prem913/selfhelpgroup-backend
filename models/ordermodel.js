const mongoose = require("mongoose");

const ordermodel = mongoose.Schema(
  {
    departmentid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    instituteid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
    institutename: {
      type: String,
      required: true,
    },
    institutelocation: {
      type: String,
      required: true,
    },
    itemtype: {
      type: String,
      required: true,
      enum: ["packed", "loose"],
    },
    itemname: {
      type: String,
      required: true,
    },
    itemquantity: {
      type: Number,
      required: true,
    },
    itemunit: {
      type: String,
      enum: ["kg", "dozen"],
    },
    itemprice: {
      type: Number,
      required: true,
    },
    itemdescription: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected"],
    },
    bid: [
      {
        shgId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Shg",
        },
        shgname: {
          type: String,
          required: true,
        },
        shgcontact: {
          type: String,
          required: true,
        },
        shglocation: {
          type: String,
          required: true,
        },
        shgproduct: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        manufacturingdate: {
          type: Date,
        },
        expirydate: {
          type: Date,
        },
        unit: {
          type: String,
        },
      },
    ],
    approvedshg: {
      shgId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shg",
      },
      shgname: {
        type: String,
      },
      shgcontact: {
        type: String,
      },
      shglocation: {
        type: String,
      },
      shgproduct: {
        type: String,
      },
      quantity: {
        type: Number,
      },
      price: {
        type: Number,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", ordermodel);
