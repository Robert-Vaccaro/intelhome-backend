const jwt = require('jsonwebtoken');
const { generateTokens } = require('../logic/tokens');
const { sendEmailCode } = require('../logic/email');
const sendSms = require('../logic/twilio');
const Users = require("../schemas/users"); // Import the Users model
const Notifications = require("../schemas/notifications"); // Import the Notifications model
const Devices = require("../schemas/devices"); // Import the Devices model

const env = require('../config/env');
const moment = require("moment-timezone");
const { getCurrentTime, generateCode } = require('../logic/user');
const { Types } = require('mongoose');

// Refresh Token
exports.refreshToken = async (req, res) => {
    try {
        const { userId, refreshToken } = req.body;
        const decoded = jwt.verify(refreshToken, env.jwtKey);
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }
        const tokens = generateTokens(userId);
        res.status(200).json(tokens);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};

exports.demoSignIn = async (req, res) => {
    try {
        const { password } = req.body;
        if (password === env.secretPassword) {
            let userId = new Types.ObjectId(String(env.demoId))
            const user = await Users.findOne({userId})
            const tokens = generateTokens(userId);
            return res.status(200).json({ message: 'Success', user, tokens });
        } else {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};

// Credential Check
exports.credCheck = async (req, res) => {
    try {
        const userId = req.decodedUserId;
        const user = await Users.findOne({ userId });

        if (!user) return res.status(404).json({ error: 'User not found' });
        if (!user.phoneVerification) return res.status(403).json({ error: 'Phone not verified' });
        if (!user.emailVerification) return res.status(403).json({ error: 'Email not verified' });
        
        const tokens = generateTokens(userId);
        return res.status(200).json({ message: 'User verified', user, tokens });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};

// Sign In or Register
exports.enterPhone = async (req, res) => {
    try {
        const { phone, DTString } = req.body;

        // Find or create the user
        let user = await Users.findOneAndUpdate(
            { phone }, // Search by phone
            { 
                $setOnInsert: { phone }, // Create a new user if not found
            }, 
            { new: true, upsert: true } // Return the updated document or create it
        );

        // Generate a code and update user details
        const code = generateCode();
        user.phoneCode = code;
        user.DTString = DTString || "";
        user.phoneCodeExp = getCurrentTime();
        await user.save();

        // Send OTP via SMS
        await sendSms(user.phone, `Your IntelHome verification code is: ${code}`);

        // Return success response
        const statusCode = user.wasNew ? 201 : 200; // Check if the user was newly created
        return res.status(statusCode).json({ message: "Success", tokens: generateTokens(user.userId) });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};

exports.resendPhoneCode = async (req, res) => {
    try {
        const userId = req.decodedUserId;
        const user = await Users.findOne({ userId });
        if (user) {
            const phoneCode = generateCode();
            user.phoneCode = phoneCode;
            user.phoneCodeExp = getCurrentTime();
            await user.save();
            await sendSms(user.phone, `Your IntelHome verification code is: ${phoneCode}`); // Send OTP
        }
        return res.status(200).json({ message: 'Phone code sent successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};

// Check Phone Code
exports.checkPhoneCode = async (req, res) => {
    try {
        const userId = req.decodedUserId
        const { code } = req.body;
        const user = await Users.findOne({ userId });
        if (user && user.phoneCode === code) {
            const currentTime = getCurrentTime(); // Current time in seconds
            const tenMinutes = 10 * 60; // 10 minutes in seconds
            if (currentTime - user.phoneCodeExp > tenMinutes) {
                return res.status(403).json({ message: 'Code expired' });
            }

            // Update user verification status
            user.phoneVerification = true;
            user.phoneCode = "";
            user.phoneCodeExp = 0;
            await user.save();

            res.status(200).json({ message: 'Phone verified', user, tokens: generateTokens(user.userId) });
        } else {
            res.status(403).json({ error: 'Invalid code or user not found' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};


exports.enterEmail = async (req, res) => {
    try {
        const userId = req.decodedUserId;
        const { email } = req.body;
        const user = await Users.findOne({ userId });
        if (user) {
            const code = generateCode();
            user.email = email
            user.emailCode = code;
            user.emailCodeExp = getCurrentTime();
            await user.save();
            await sendEmailCode(user.email, code); // Send OTP via email
            return res.status(200).json({ message: "Success" });
        }
        return res.status(404).json({ error: "User not found" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};

// Resend Email Code
exports.resendEmailCode = async (req, res) => {
    try {
        const userId = req.decodedUserId;
        const user = await Users.findOne({ userId });
        if (user) {
            const emailCode = generateCode();
            user.emailCode = emailCode;
            user.emailCodeExp = getCurrentTime();
            await user.save();
            await sendEmailCode(user.email, emailCode); // Send OTP
            return res.status(200).json({ message: 'Email code sent successfully' });
        }
        return res.status(404).json({ error: 'User not found' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};

// Check Email Code
exports.checkEmailCode = async (req, res) => {
    try {
        const userId = req.decodedUserId
        const { code } = req.body;
        const user = await Users.findOne({ userId });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
        }
        if (user.emailCode === code) {
            const currentTime = getCurrentTime(); // Current time in seconds
            const tenMinutes = 10 * 60; // 10 minutes in seconds
            if (currentTime - user.emailCodeExp > tenMinutes) {
                return res.status(403).json({ error: 'Code expired' });
            }

            // Update user verification status
            user.emailVerification = true;
            user.emailCode = "";
            user.emailCodeExp = 0;
            await user.save();

            res.status(200).json({ message: 'Email verified' });
        } else {
            res.status(403).json({ error: 'Invalid code' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};

exports.saveName = async (req, res) => {
    try {
        const userId = req.decodedUserId
        const { firstName, lastName } = req.body;
        const user = await Users.findOne({ userId });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
        }
        user.firstName = firstName
        user.lastName = lastName
        await user.save()
        return res.status(200).json({ message: 'Success', user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};

// Update Email Notifications
exports.updateEmailNotifications = async (req, res) => {
    try {
        const userId = req.decodedUserId;
        const { emailNotifications } = req.body;

        if (typeof emailNotifications !== "boolean") {
            return res.status(400).json({ error: "Invalid value for emailNotifications" });
        }

        const user = await Users.findOne({ userId });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.emailNotifications = emailNotifications; // Update email notifications
        await user.save();

        return res.status(200).json({
            message: "Email notifications updated"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};

// Update Phone Notifications
exports.updateTextNotifications = async (req, res) => {
    try {
        const userId = req.decodedUserId;
        const { textNotifications } = req.body;

        if (typeof textNotifications !== "boolean") {
            return res.status(400).json({ error: "Invalid value for textNotifications" });
        }

        const user = await Users.findOne({ userId });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.textNotifications = textNotifications; // Update text notifications
        await user.save();

        return res.status(200).json({
            message: "Text notifications updated"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};

// Update Push Notifications
exports.updatePushNotifications = async (req, res) => {
    try {
        const userId = req.decodedUserId;
        const { pushNotifications } = req.body;

        if (typeof pushNotifications !== "boolean") {
            return res.status(400).json({ error: "Invalid value for pushNotifications" });
        }

        const user = await Users.findOne({ userId });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.pushNotifications = pushNotifications; // Update push notifications
        await user.save();

        return res.status(200).json({
            message: "Push notifications updated"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};


// Delete Account
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.decodedUserId;

        // Delete all notifications associated with the userId
        await Notifications.deleteMany({ userId });

        // Delete all devices associated with the userId
        await Devices.deleteMany({ userId });

        // Delete the user account
        const result = await Users.findOneAndDelete({ userId });
        
        if (!result) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({ message: 'User and associated data deleted successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};