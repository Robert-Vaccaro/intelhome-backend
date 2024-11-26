const express = require("express");
const {
    refreshToken,
    credCheck,
    enterPhone,
    resendPhoneCode,
    checkPhoneCode,
    enterEmail,
    resendEmailCode,
    checkEmailCode,
    deleteAccount,
    saveName,
    demoSignIn,
    updateEmailNotifications,
    updatePushNotifications,
    updateTextNotifications
} = require("../controllers/users");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Demo Sign In
router.post("/demo-sign-in", demoSignIn);

// Phone-based routes
router.post("/enter-phone", enterPhone); // Send phone code
router.post("/resend-phone-code", authMiddleware, resendPhoneCode); // Resend phone code
router.post("/check-phone-code", authMiddleware, checkPhoneCode); // Verify phone code

// Email-based routes
router.post("/enter-email", authMiddleware, enterEmail); // Send email code
router.post("/resend-email-code", authMiddleware, resendEmailCode); // Resend email code
router.post("/check-email-code", authMiddleware, checkEmailCode); // Verify email code

// Token management
router.post("/refresh-token", authMiddleware, refreshToken); // Refresh tokens

// Credential checks
router.post("/cred-check", authMiddleware, credCheck); // Check credentials for phone/email verification

// Account management
router.post("/save-name", authMiddleware, saveName); // save user's name
router.delete("/", authMiddleware, deleteAccount); // Delete user account

// Routes for updating notification preferences
router.put("/email-notifications", authMiddleware, updateEmailNotifications);
router.put("/text-notifications", authMiddleware, updateTextNotifications);
router.put("/push-notifications", authMiddleware, updatePushNotifications);

module.exports = router;
