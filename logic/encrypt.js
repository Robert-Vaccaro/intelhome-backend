const crypto = require('crypto');
const env = require('../config/env');

const algorithm = 'aes-256-cbc';
const key = Buffer.from(env.key, 'hex');

// Encrypt function
function encrypt(text) {
    const iv = crypto.randomBytes(16); // Generate a 16-byte IV
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted; // Store IV and encrypted text together
}

// Decrypt function
function decrypt(text) {
    let textParts = text.split(':');
    
    const iv = Buffer.from(textParts.shift(), 'hex'); // Extract the IV from the stored data
    const encryptedText = Buffer.from(textParts.join(':'), 'hex'); // Get the encrypted data
    
    // Check if IV is of correct length (16 bytes for aes-256-cbc)
    if (iv.length !== 16) {
        throw new Error('Invalid IV length. Expected 16 bytes, but got ' + iv.length + ' bytes');
    }

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = { encrypt, decrypt };
