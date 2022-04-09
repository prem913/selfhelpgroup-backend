const mongoose = require("mongoose");

const organisationmodel = mongoose.Schema(
  {
    department: {
      type: String,
      required: true,
      enum: [
        "Healthcare",
        "Education",
        "Tribal Welfare",
        "Social Welfare",
        "Women and child development",
      ],
    },
    name: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
//type of products list
// packed item and loose items
//list of packed items and loose items
//add quantity of
// date time quantity of order in print format
