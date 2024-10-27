const mongoose = require("mongoose");

var ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    locationId: { type: String, required: true, index: true },
    locationName: { type: String },
    name: { type: String },
    closedAt: { type: String},
    guestCount: { type: String },
    open: { type: Boolean, default: true },
    openedAt: { type: Number },
    paid: { type: Boolean, default: false },
    paidAt: { type: Number },
    posId: { type: Number },
    discounts: { type: Array },
    totals: { type: Object },
    void: { type: Boolean },
    employeeId: { type: String },
    orderTypeId: { type: String },
    revenueCenterId: { type: String },
    tableId: { type: String },
    otherUsers: { type: Array, default: [] },
    autoSend: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

exports.tickets = mongoose.model("tickets", ticketSchema);
