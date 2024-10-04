const mongoose = require("mongoose");

var userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },  // Index on userId for faster queries
    email_address: { type: String, required: true, index: true },  // Index on email_address
    password: { type: String, required: true },
    type: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    profilePhoto: { type: String },
    banned: { type: Boolean, default: false },  // Assuming banned is a Boolean
    verified: { type: Boolean, default: false },
    emailVerification: { type: Number },
    DTString: { type: String },
  },
  {
    timestamps: true,  // Automatically adds createdAt and updatedAt fields
  }
);

// Export the model
exports.users = mongoose.model("users", userSchema);
