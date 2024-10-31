const mongoose = require("mongoose");
const moment = require("moment-timezone");

var ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    locationId: { type: String, required: true, index: true },
    locationName: { type: String },
    ticketName: { type: String, default: "New Ticket" },
    open: { type: Boolean, default: true },
    openedAt: { type: Number, default: () => moment(moment().tz(moment.tz.guess())).unix() }, // Inline function
    otherUsers: { type: Array, default: [] },
  },
  {
    timestamps: true,
  }
);

exports.tickets = mongoose.model("tickets", ticketSchema);
