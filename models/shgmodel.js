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
            department: {
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
    otp: String,
    devicetoken: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("shg", shgSchema);
