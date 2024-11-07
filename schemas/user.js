const mongoose = require("mongoose");

var userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    phone: { type: String, required: true, index: true },
    email: { type: String, index: true },
    role: { type: Array, default: []  },
    firstName: { type: String, default: ""  },
    lastName: { type: String, default: ""  },
    profilePhoto: { type: String, default: ""  },
    banned: { type: Boolean, default: false },
    isLoggingIn: { type: Boolean, default: false },
    phoneVerification: { type: Boolean, default: false },
    phoneCode: { type: String, default: "" },
    phoneCodeExp: { type: Number, default: 0 },
    emailVerification: { type: Boolean, default: false },
    emailCode: { type: String, default: "" },
    emailCodeExp: { type: Number, default: 0 },
    paymentMethods:  { type: Array, default: [] },
    DTString: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

exports.users = mongoose.model("users", userSchema);
