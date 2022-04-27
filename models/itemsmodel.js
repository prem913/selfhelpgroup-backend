const mongoose = require("mongoose");

const itemsSchema = mongoose.Schema({
  itemname: {
    type: String,
    required: true,
  },
  itemtype: {
    type: String,
    enum: ["packed", "loose"],
    required: true,
  },
  itemdescription: {
    type: String,
    required: true,
  },
  itemprice: {
    type: Number,
    required: true,
  },
  itemunit: {
    type: String,
  },
});

module.exports = mongoose.model("item", itemsSchema);
