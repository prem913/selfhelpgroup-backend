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
        bidorderid: {
          type: mongoose.Schema.Types.ObjectId,
        },
        orderstatus: {
          type: String,
          enum: ["pending", "approved"],
        },
      },
    ],
    otp: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("shg", shgSchema);
