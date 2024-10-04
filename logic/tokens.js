const jwt = require('jsonwebtoken');
const env = require('../config/env')
const tokenSecret = env.jwtKey;
const accessTokenLife = '1h'; // Access token expiration time
const refreshTokenLife = '7d'; // Refresh token expiration time

/**
 * Generate an access token and a refresh token for a user.
 * @param {object} user - The user object (e.g., { id: 'user_id', email: 'user@example.com' }).
 * @returns {object} - An object containing the access token and refresh token.
 */
function generateTokens(userId) {
    const payload = { userId : userId };

    const accessToken = jwt.sign(
        payload,
        tokenSecret,
        { expiresIn: accessTokenLife }
    );

    const refreshToken = jwt.sign(
        payload,
        tokenSecret,
        { expiresIn: refreshTokenLife }
    );

    return {
        accessToken,
        refreshToken
    };
}


/**
 * Verify an access token.
 * @param {string} token - The access token to verify.
 * @returns {object|false} - The decoded token payload if valid, otherwise false.
 */
function verifyAccessToken(token) {
    try {
        return jwt.verify(token, tokenSecret);
    } catch (err) {
        return false;
    }
}

/**
 * Verify a refresh token.
 * @param {string} token - The refresh token to verify.
 * @returns {object|false} - The decoded token payload if valid, otherwise false.
 */
function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, tokenSecret);
    } catch (err) {
        return false;
    }
}

/**
 * Refresh an access token using a valid refresh token.
 * @param {string} refreshToken - The refresh token.
 * @returns {string|null} - A new access token if the refresh token is valid, otherwise null.
 */
function refreshAccessToken(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) return null;

    const newAccessToken = jwt.sign(
        { userId: decoded.userId },
        tokenSecret,
        { expiresIn: accessTokenLife }
    );

    return newAccessToken;
}

module.exports = {
    generateTokens,
    verifyAccessToken,
    verifyRefreshToken,
    refreshAccessToken
};
