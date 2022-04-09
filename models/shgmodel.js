const mongoose = require("mongoose");
// location latitude and longitude
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
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        manufacturingdate: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);
