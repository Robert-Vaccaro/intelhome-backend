const crypto = require('crypto');
const env = require('../config/env');

const algorithm = 'aes-256-cbc';
const key = Buffer.from(env.key, 'hex');

function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
    if (!text) {
        throw new Error('Text to decrypt is null or undefined');
    }
    let textParts = text.split(':');
    
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    
    if (iv.length !== 16) {
        throw new Error('Invalid IV length. Expected 16 bytes, but got ' + iv.length + ' bytes');
    }

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = { encrypt, decrypt };
