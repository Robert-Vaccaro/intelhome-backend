const mongoose = require("mongoose");

var creditCardSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    cardId: { type: String, required: true, index: true },
    cardName: { type: String, default: "No Card Name" },
    cardData: { type: String },
    verified: { type: Boolean, default: false},
    default: { type: Boolean, default: false},
  },
  {
    timestamps: true,
  }
);

exports.creditCards = mongoose.model("creditCards", creditCardSchema);