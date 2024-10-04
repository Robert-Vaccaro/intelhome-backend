const jwt = require('jsonwebtoken');
const env = require('../config/env');

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split("Bearer ")[1];
    console.log(token)
    if (!token) {
        return res.status(401).json({ message: 'Authorization denied: No token provided' });
    }
    try {
        const decoded = jwt.verify(token, env.jwtKey);
        const { userId, email } = decoded;
        req.user = {
            userId,
            email
        };
        next();
    } catch (e) {
        return res.status(401).json({ message: 'Authorization denied: Invalid token' });
    }
};
