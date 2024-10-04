const moment = require('moment-timezone');
const jwt = require('jsonwebtoken');
const { loginUser, createUser, submitInspectionInfo } = require('../logic/user');
const { generateTokens } = require('../logic/tokens');
const env = require('../config/env');
const bcrypt = require('bcryptjs');  // bcrypt to compare hashed password
const { users } = require('../schemas/user');
const { OAuth2Client } = require('google-auth-library');
const { sendEmail, sendEmailCode, sendInspectionBoostEmail, sendPasswordResetCode } = require('../logic/email');
const client = new OAuth2Client(env.googleClientID);

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
        const { refreshToken } = req.body;
        const decoded = jwt.verify(refreshToken, jwtKey);

        if (decoded) {
            const newTokens = generateTokens();
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
        const { userId, idToken, type } = req.body;

        const user = await users.findOne({ userId: userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const tokens = generateTokens(userId);
        if (type === "google") {
            // Step 1: Decode the token to inspect its audience
            const decodedToken = jwt.decode(idToken);
            if (decodedToken.aud != env.googleClientID) {
                return res.status(400).json({ error: 'Invalid audience: token is not intended for this application.' });
            }

            // Step 2: Verify the Google Access Token
            const ticket = await client.verifyIdToken({
                idToken: idToken,
                audience: env.googleClientID, // This must match the 'aud' claim in the token
            });

            const payload = ticket.getPayload();
            const googleUserId = payload['sub']; // Google's unique user ID
            if (userId === googleUserId) {
                res.status(200).json({ user, tokens });
            }
        } else {
            user.password = "";  // Mask the password
            res.status(200).json({ user, tokens });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Server Error" });
    }
};

// Helper function to send user response (mask password and return tokens)
const sendUserResponse = (user, res) => {
    const tokens = generateTokens(user.email_address);  // Generate your tokens here
    user.password = "";  // Mask the password
    return res.status(200).json({ user, tokens });
};

exports.login = async (req, res) => {
    try {
        const { email, password, idToken, type } = req.body;

        // Step 1: Find the user by email
        const user = await users.findOne({ email_address: email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Step 2: If type is "google", validate the Google ID token
        if (type === "google") {
            if (!idToken) {
                return res.status(400).json({ error: 'Google ID token is required.' });
            }

            // Decode the token to inspect its audience
            const decodedToken = jwt.decode(idToken);
            if (decodedToken.aud !== env.googleClientID) {
                return res.status(400).json({ error: 'Invalid audience: token is not intended for this application.' });
            }

            // Verify the Google Access Token
            const ticket = await client.verifyIdToken({
                idToken: idToken,
                audience: env.googleClientID,
            });

            const payload = ticket.getPayload();
            const googleUserId = payload['sub']; // Google's unique user ID

            // Compare Google user ID with the user's record (ensure it's the same user)
            if (user.userId !== googleUserId) {
                return res.status(401).json({ error: 'Invalid Google user ID.' });
            }

            // Google ID token is valid, proceed with login
            return sendUserResponse(user, res);
        }

        // Step 3: If type is empty, proceed with regular password validation
        const passwordMatch = await bcrypt.compare(password, user.password); // Assuming `user.password` stores hashed password

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Step 4: Return user details (excluding password)
        return sendUserResponse(user, res);

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Server Error" });
    }
};

exports.register = async (req, res) => {
    try {
        // Call createUser function and handle the response
        let newUser = await createUser(req.body);

        // Check if there was an error during user creation
        if (newUser.error) {
            // If there's an error, return the corresponding status and message
            return res.status(newUser.status).json({ message: newUser.message });
        }
        const newTokens = generateTokens(newUser.userId);  
        if (req.body.type === ""){
            let newCode = generateCode()
            newUser.emailVerification = newCode
            newUser = await newUser.save()
            let results = await sendEmailCode(newUser, newCode)
        } else {
            newUser.verified = true
            newUser = await newUser.save() 
        }

        res.status(200).json({
            user: newUser,  // newUser should already exclude password
            tokens: newTokens
        });

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

exports.emailCode = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await users.findOne({ userId: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        let newCode = generateCode()
        user.emailVerification = newCode
        let newUser = await user.save()
        let results = await sendEmailCode(user, newCode)
        res.status(200).json({ message: 'User code sent successfully' });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Server Error" });
    }
};

exports.emailVerification = async (req, res) => {
    try {
        const { userId, code } = req.body;
        const user = await users.findOne({ userId: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (parseInt(code) === user.emailVerification) {
            user.verified = true
            user.emailVerification = ""
            let newUser = await user.save()
            res.status(200).json({ message: 'User verified'});
        } else {
            res.status(400).json({ message: 'User not verified'});
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Server Error" });
    }
};


exports.sendPWResetCode = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await users.findOne({ email_address: email });
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
        const user = await users.findOne({ email_address: email });
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
        const user = await users.findOne({ email_address: email });
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