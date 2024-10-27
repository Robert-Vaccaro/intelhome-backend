const moment = require('moment-timezone');
const jwt = require('jsonwebtoken');
const { loginUser, createUser, submitInspectionInfo } = require('../logic/user');
const { generateTokens } = require('../logic/tokens');
const env = require('../config/env');
const bcrypt = require('bcryptjs');  // bcrypt to compare hashed password
const { users } = require('../schemas/user');
const { OAuth2Client } = require('google-auth-library');
const { sendEmail, sendEmailCode, sendInspectionBoostEmail, sendPasswordResetCode, sendEarlyAccessEmail } = require('../logic/email');
const sendSms = require('../logic/twilio');
const client = new OAuth2Client(env.googleClientID);
const { db } = require('../config/database');

const { subscribers } = require('../schemas/subscribe');

exports.earlyAccess = async (req, res) => {
    try {
        const { email } = req.body;
        const existingSubscriber = await subscribers.findOne({ email, unsubscribed: false });
        if (!existingSubscriber) {
            const unsubscribeCode = generateUnsubscribeCode();
            const result = await subscribers.findOneAndUpdate(
                { email }, 
                { email, unsubscribeCode, unsubscribed: false },
                { upsert: true, new: true }
            );
            await sendEarlyAccessEmail(email, unsubscribeCode)
            res.status(200).json({ message: "Success: You have been added to the early access list" });
        } else {
            res.status(200).json({ message: "You're already on the early access list" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
};

function generateUnsubscribeCode() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

exports.unsubscribeEarlyAccess = async (req, res) => {
    try {
        const { email, code } = req.query;
        const subscriber = await subscribers.findOne({ email, unsubscribeCode: code });
        if (subscriber) {
            subscriber.unsubscribed = true;
            await subscriber.save();
            res.status(200).render('unsubscribe-success', { message: "You have been successfully unsubscribed from early access." });
        } else {
            res.status(404).render('unsubscribe-error', { error: "Invalid email or code. Please try again." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).render('unsubscribe-error', { error: "Server Error. Please try again later." });
    }
};
