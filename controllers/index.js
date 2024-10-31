const moment = require('moment-timezone');
const jwt = require('jsonwebtoken');
const { loginUser, createUser, submitInspectionInfo, getCurrentTime } = require('../logic/user');
const { generateTokens } = require('../logic/tokens');
const env = require('../config/env');
const bcrypt = require('bcryptjs');  // bcrypt to compare hashed password
const { users } = require('../schemas/user');
const { OAuth2Client } = require('google-auth-library');
const { sendEmail, sendEmailCode, sendInspectionBoostEmail, sendPasswordResetCode } = require('../logic/email');
const sendSms = require('../logic/twilio');
const client = new OAuth2Client(env.googleClientID);
const { db } = require('../config/database');

function generateCode(min = 1000, max = 10000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.test = async (req, res) => {
    try {
        res.status(200).json({message: "Success"});
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Server Error" });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { userId, refreshToken } = req.body;
        const decoded = jwt.verify(refreshToken, jwtKey);

        if (decoded) {
            const newTokens = generateTokens(userId);
            res.status(200).json(newTokens);
        } else {
            res.status(401).json(['Authorization denied']);
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Server Error" });
    }
};

exports.credCheck = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await users.findOne({ userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }else if (!user.phoneVerification) {
            return res.status(403).json({ error: 'Phone not verified' });
        }else if (!user.emailVerification) {
            return res.status(403).json({ error: 'Email not verified' });
        }
        let tokens = generateTokens(userId)
        return res.status(200).json({ message: 'User verified', user, tokens});
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Server Error" });
    }
};

exports.signIn = async (req, res) => {
    try {
        const { phone, DTString } = req.body;
        const user = await users.findOne({ phone });
        if (user) {
            const code = generateCode();
            user.phoneCode = code;
            user.isLoggingIn = true;
            user.DTString = DTString || ""
            user.phoneCodeExp = getCurrentTime(); // Save current time in epoch milliseconds
            let updatedUser = await user.save();
            let results = await sendSms(user.phone, code);
        }
        return res.status(200).json({ message: "Success" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" });
    }
};

//for login purposes
exports.checkPhoneCode = async (req, res) => {
    try {
        const { phone, code } = req.body;
        const user = await users.findOne({ phone });
        
        if (user) {
            const currentTime = getCurrentTime(); // Current time in epoch milliseconds
            const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
            
            if (user.phoneCode && parseInt(code) === user.phoneCode) {
                // Check if the current time exceeds the expiration time (10 minutes from generation)
                if (currentTime - user.phoneCodeExp > tenMinutes) {
                    return res.status(403).json({ message: 'Code Expired' });
                }
                
                let tokens = generateTokens(user.userId);
                user.phoneVerification = true;
                user.phoneCode = ""; // Clear the phone code after successful verification
                await user.save();

                return res.status(200).json({ message: 'User verified', user, tokens });
            } else {
                return res.status(403).json({ message: 'Incorrect Code' });
            }
        } else {
            return res.status(403).json({ message: 'User not found' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" });
    }
};


exports.register = async (req, res) => {
    try {
        let createUserResults = await createUser(req.body);

        // if (newUser.error) {
        //     return res.status(400).json({ error: newUser.error });
        // }
        if (!createUserResults.user){
            return res.status(400).json({ error: newUser.error });
        }
        let user = createUserResults.user
        const newTokens = generateTokens(user.userId);
        user.isLoggingIn = true
        user = await user.save()
        return res.status(200).json({
            tokens: newTokens
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Server Error" });
    }
};

//for registration purposes

exports.phoneCode = async (req, res) => {
    try {
        const { phone } = req.body;
        let user = await users.findOne({ phone });
        if (user && user.isLoggingIn) {
            let phoneCode = generateCode()
            user.phoneCode = phoneCode
            user.phoneCodeExp = getCurrentTime();
            user = await user.save()
            let sendSmsResults = await sendSms(user.phone, phoneCode)
        }
        return res.status(200).json({ message: 'User code sent successfully' });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Server Error" });
    }
};

exports.phoneVerification = async (req, res) => {
    try {
        const { phone, code } = req.body;
        const user = await users.findOne({ phone });
        if (user) {
            if (user.isLoggingIn && parseInt(code) === user.phoneCode) {
                user.phoneVerification = true
                user.phoneCode = ""
                user.phoneCodeExp = 0
                if (user.emailVerification) {
                    user.isLoggingIn = false
                }
                let user = await user.save()
                return res.status(200).json({ message: 'User verified'});
            } else {
                return res.status(400).json({ message: 'Incorrect Code'});
            }
        }
        return res.status(400).json({ message: 'Incorrect Code'});
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Server Error" });
    }
};

//for registration purposes

exports.emailCode = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await users.findOne({ email });
        if (user && user.isLoggingIn) {
            let emailCode = generateCode()
            user.emailCode = emailCode
            user.emailCodeExp = getCurrentTime();
            user = await user.save()
            let sendEmailCodeResults = await sendEmailCode(user, emailCode)
        }
        return res.status(200).json({ message: 'User code sent successfully' });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Server Error" });
    }
};

exports.emailVerification = async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await users.findOne({ email });
        if (user) {
            if (user.isLoggingIn && parseInt(code) === user.emailCode) {
                user.emailVerification = true
                user.emailCode = ""
                user.emailCodeExp = 0
                user.isLoggingIn = false
                let user = await user.save()
                return res.status(200).json({ message: 'User verified'});
            } else {
                return res.status(400).json({ message: 'Incorrect Code'});
            }
        }
        return res.status(400).json({ message: 'Incorrect Code'});
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Server Error" });
    }
};

exports.sendPWResetCode = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await users.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        } else {
            let newCode = generateCode()
            user.emailVerification = `${newCode}`
            let newUser = await user.save()
            let results = await sendPasswordResetCode(newUser, newCode)
            return res.status(200).json({ message: 'Code Sent'});
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Server Error" });
    }
};
exports.checkPWResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await users.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (code == user.emailVerification) {
            res.status(200).json({ message: 'Correct Code'});
        } else {
            res.status(400).json({ message: 'Incorrect Code'});
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Server Error" });
    }
};

exports.updatePW = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await users.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.emailVerification === undefined || user.emailVerification === null || user.emailVerification === "") {
            return res.status(400).json({ error: 'Error'});
        }
        let hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword
        user.emailVerification = ""
        let newUser = await user.save()
        res.status(200).json({ message: 'Updated Password'});
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Server Error" });
    }
};

exports.authedUpdatePW = async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;
        const user = await users.findOne({ userId: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Step 3: If type is empty, proceed with regular password validation
        const passwordMatch = await bcrypt.compare(oldPassword, user.password); // Assuming `user.password` stores hashed password

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        let hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword
        user.emailVerification = ""
        let newUser = await user.save()
        res.status(200).json({ message: 'Updated Password'});
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Server Error" });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const { userId } = req.body;
        const result = await users.findOneAndDelete({ userId: userId });
        if (!result) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully', deletedUser: result });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Server Error" });
    }
};
