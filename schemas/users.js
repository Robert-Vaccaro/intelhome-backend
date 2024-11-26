const mongoose = require("mongoose");
const moment = require("moment-timezone");

const userSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, default: function () { return this._id; }, index: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, index: true, default: "" },
    role: { type: [String], default: ["USER"] },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    profilePhoto: { type: String, default: "" },
    banned: { type: Boolean, default: false },
    phoneVerification: { type: Boolean, default: false },
    phoneCode: { type: String, default: "" },
    phoneCodeExp: { type: Number, default: () => moment(moment().tz(moment.tz.guess())).unix() },
    emailVerification: { type: Boolean, default: false },
    emailCode: { type: String, default: "" },
    emailCodeExp: { type: Number, default: () => moment(moment().tz(moment.tz.guess())).unix() },
    locations: { type: [String], default: [] },
    emailNotifications: { type: Boolean, default: true },
    textNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    DTString: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);
