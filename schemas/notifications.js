const mongoose = require("mongoose");
const moment = require("moment-timezone");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true }, // Reference to Users
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Device" },
    message: { type: String, required: true },
    createdAt: { type: Number, default: () => moment(moment().tz(moment.tz.guess())).unix() },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notifications", notificationSchema);
