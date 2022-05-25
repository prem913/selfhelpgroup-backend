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
    items: [
      {
        itemid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Items",
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
        approvedquantity: {
          type: Number,
          required: true,
          default: 0,
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
        },
      },
    ],
    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "cancelled", "completed"],
    },
    bid: [
      {
        type: new mongoose.Schema(
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
            products: [
              {
                shgproduct: {
                  type: String,
                  required: true,
                },
                quantity: {
                  type: Number,
                  required: true,
                },
                unit: {
                  type: String,
                },
                unitprice: {
                  type: Number,
                  required: true,
                },
                totalprice: {
                  type: Number,
                  required: true,
                },
                manufacturingdate: {
                  type: Date,
                },
                expirydate: {
                  type: Date,
                },
              },
            ],
            manufacturingdate: {
              type: Date,
            },
            expirydate: {
              type: Date,
            },
            unit: {
              type: String,
            },
            status: {
              type: String,
              enum: ["pending", "approved", "cancelled", "completed"],
            },
          },
          { timestamps: true }
        ),
      },
    ],
    approvedbid: [
      {
        type: new mongoose.Schema(
          {
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
            products: [],
            delivered: {
              type: Boolean,
              default: false,
            },
            deliveryverified: {
              type: Boolean,
              default: false,
            },
          },
          { timestamps: true }
        ),
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", ordermodel);
