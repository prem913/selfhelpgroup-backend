const mongoose = require("mongoose");
//  to implement location latitude and longitude
const shgSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    products: [
      {
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
          enum: ["packed", "loose"],
        },
        quantity: {
          type: Number,
          required: true,
        },
        unit: {
          type: String,
          enum: ["kg", "dozen"],
        },
        manufacturingdate: {
          type: Date,
        },
        expirydate: {
          type: Date,
        },
      },
    ],
    orders: [
      {
        type: new mongoose.Schema(
          {
            orderid: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Order",
            },
            institutename: {
              type: String,
            },
            institutelocation: {
              type: String,
            },
            institutecontact: {
              type: String,
            },
            department: {
              type: String,
            },
            products: [],
            totalamount: {
              type: Number,
              default: 0,
            },
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
    zone: [
      {
        zoneid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Zone",
          required: true,
        },
        zonename: {
          type: String,
          required: true,
        },
      }
    ],
    january: {
      type: Number,
      default: 0
    },
    february: {
      type: Number,
      default: 0
    },
    march: {
      type: Number,
      default: 0
    },
    april: {
      type: Number,
      default: 0
    },
    may: {
      type: Number,
      default: 0
    },
    june: {
      type: Number,
      default: 0
    },
    july: {
      type: Number,
      default: 0
    },
    august: {
      type: Number,
      default: 0
    },
    september: {
      type: Number,
      default: 0
    },
    october: {
      type: Number,
      default: 0
    },
    november: {
      type: Number,
      default: 0
    },
    december: {
      type: Number,
      default: 0
    },
    otp: String,
    devicetoken: String,
    totalrevenue: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("shg", shgSchema);
