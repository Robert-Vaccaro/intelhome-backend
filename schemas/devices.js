const mongoose = require("mongoose");
const moment = require("moment-timezone");

const deviceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true }, // Reference to Users
    name: { type: String, required: true },
    type: { type: String, required: true },
    location: { type: String, required: true },
    capabilities: { type: [String], required: true },
    specifications: { type: String, required: true },
    detectedAt: { type: Number, default: () => moment(moment().tz(moment.tz.guess())).unix() },
    needsUpdate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Devices", deviceSchema);
