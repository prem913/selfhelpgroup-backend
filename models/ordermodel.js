const mongoose = require("mongoose");

const ordermodel = mongoose.Schema({
  organisation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organisation",
    required: true,
  },
});
