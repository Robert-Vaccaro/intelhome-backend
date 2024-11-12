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
const { saveCreditCard } = require('../logic/creditCard');
const { creditCards } = require('../schemas/cards');

exports.getCards = async (req, res) => {
    try {
        const { userId } = req.query;
        const user = await users.findOne({ userId });
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Retrieve and populate payment methods
        const populatedPaymentMethods = await Promise.all(
            user.paymentMethods.map(async (cardId) => {
                return await creditCards.findOne({ cardId }).select('-cardData -__v -_id');
            })
        );

        // Sort the array so default cards come first, and the rest by `createdAt` descending
        const sortedPaymentMethods = populatedPaymentMethods
            .filter(card => card) // Exclude any null/undefined results
            .sort((a, b) => {
                if (a.default !== b.default) {
                    return a.default ? -1 : 1; // Default card first
                }
                return new Date(b.createdAt) - new Date(a.createdAt); // Newest first by createdAt
            });

        return res.status(200).json(sortedPaymentMethods);
    } catch (error) {
        console.error("Error retrieving payment methods:", error);
        return res.status(500).json({ error: "Server Error" });
    }
};

exports.getCards = async (req, res) => {
    try {
        const { userId } = req.query;
        const user = await users.findOne({ userId });
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Retrieve and populate payment methods
        const populatedPaymentMethods = await Promise.all(
            user.paymentMethods.map(async (cardId) => {
                return await creditCards.findOne({ cardId }).select('-cardData -__v -_id');
            })
        );

        // Sort the array so default cards come first, and the rest by `createdAt` descending
        const sortedPaymentMethods = populatedPaymentMethods
            .filter(card => card) // Exclude any null/undefined results
            .sort((a, b) => {
                if (a.default !== b.default) {
                    return a.default ? -1 : 1; // Default card first
                }
                return new Date(b.createdAt) - new Date(a.createdAt); // Newest first by createdAt
            });
        return res.status(200).json(sortedPaymentMethods);
    } catch (error) {
        console.error("Error retrieving payment methods:", error);
        return res.status(500).json({ error: "Server Error" });
    }
};

exports.deleteCard = async (req, res) => {
    try {
        const userId = req.decodedUserId;
        const { cardId } = req.body;

        // Find the user
        const user = await users.findOne({ userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }


        // Check if there are any other cards left
        if (user.paymentMethods.length > 1) {
            const card = await creditCards.findOneAndDelete({ userId, cardId });
            if (!card) {
                return res.status(404).json({ error: "Card not found" });
            }

            // Remove the card from user's paymentMethods array
            const index = user.paymentMethods.indexOf(cardId);
            if (index > -1) {
                user.paymentMethods.splice(index, 1);
            }

            // Make the next card in the array the default
            const newDefaultCardId = user.paymentMethods[0];
            await creditCards.updateMany({ userId, default: true }, { $set: { default: false } });
            await creditCards.findOneAndUpdate(
                { userId, cardId: newDefaultCardId },
                { $set: { default: true } },
                { new: true }
            );
        } else {
            // If no cards are left, return an error
            return res.status(400).json({ error: "You must have at least one credit card on file." });
        }

        // Save updated user document
        await user.save();
        
        return res.status(200).json({ message: "Card deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};


exports.defaultCard = async (req, res) => {
    try {
        const userId = req.decodedUserId;
        const { cardId } = req.body;
        const user = await users.findOne({ userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        await creditCards.updateMany({ userId, default: true }, { $set: { default: false } });
        const card = await creditCards.findOneAndUpdate(
            { userId, cardId },
            { $set: { default: true } },
            { new: true }
        );
        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }
        return res.status(200).json({ message: "Default card updated successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};

exports.saveCard = async (req, res) => {
    try {
        const userId = req.decodedUserId;
        const { cardId } = req.body;
        const saveCardResult = saveCreditCard(req.body)

        return res.status(200).json({ message: "Card Saved" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};


exports.saveLocation = async (req, res) => {
    try {
        const { lat, long, address } = req.body
        const userId = req.decodedUserId || "";
        const user = await users.findOne({ userId });
        if (user) {
            user.coords = [lat, long] || []
            user.address = address || ""
            await user.save()
            return res.status(200).json({ message: "Location Saved", user });
        } else {
            return res.status(404).json({ message: "User Doesn't Exist" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};


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
            res.status(404).render('unsubscribe-error', { error: "Please check your unsubscribe link or contact support if you continue to experience issues." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).render('unsubscribe-error', { error: "Server Error. Please try again later." });
    }
};
