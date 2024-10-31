const mongoose = require("mongoose");

var subscribersSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    unsubscribeCode: { type: String },
    unsubscribed: { type: Boolean, default: false},
  },
  {
    timestamps: true,
  }
);

exports.subscribers = mongoose.model("subscribers", subscribersSchema);
