const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { Types } = require('mongoose');

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
        return res.status(401).json({ message: 'Authorization denied: No token provided' });
    }
    try {
        const decoded = jwt.verify(token, env.jwtKey);
        if (decoded && decoded.userId) {
            req.decodedUserId = new Types.ObjectId(String(decoded.userId));
            next();
        } else {
            return res.status(401).json({ message: 'Authorization denied: Invalid token' });
        }
    } catch (e) {
        return res.status(401).json({ message: 'Authorization denied: Invalid token' });
    }
};
