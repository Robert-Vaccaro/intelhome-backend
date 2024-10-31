const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    mongoDd: process.env.MONGO_DB === undefined ? "" : process.env.MONGO_DB,
    twilioSid: process.env.TWILIO_SID === undefined ? "" : process.env.TWILIO_SID,
    twilioToken: process.env.TWILIO_TOKEN === undefined ? "" : process.env.TWILIO_TOKEN,
    twilioPhone: process.env.TWILIO_PHONE === undefined ? "" : process.env.TWILIO_PHONE,
    awsLink: process.env.awsLink === undefined ? "" : process.env.awsLink,
    region: process.env.region === undefined ? "" : process.env.region,
    apiVersion: process.env.apiVersion === undefined ? "" : process.env.apiVersion,
    device_key: process.env.device_key === undefined ? "" : process.env.device_key,
    priv_key: process.env.priv_key === undefined ? "" : process.env.priv_key,
    priv_key2: process.env.priv_key2 === undefined ? "" : process.env.priv_key2,
    email: process.env.email === undefined ? "" : process.env.email,
    pw: process.env.pw === undefined ? "" : process.env.pw,
    helloEmail: process.env.helloEmail === undefined ? "" : process.env.helloEmail,
    helloPw: process.env.helloPw === undefined ? "" : process.env.helloPw,
    key: process.env.KEY === undefined ? "" : process.env.KEY,
    iv: process.env.IV === undefined ? "" : process.env.IV,
    googleClientID: process.env.GoogleClientID === undefined ? "" : process.env.GoogleClientID,
    googleClientSecret: process.env.GoogleClientSecret === undefined ? "" : process.env.GoogleClientSecret,
    jwtKey: process.env.JWT_KEY === undefined ? "" : process.env.JWT_KEY,
    omnivoreAPIKey: process.env.OMNIVORE_API_KEY === undefined ? "" : process.env.OMNIVORE_API_KEY,
    omnivoreAPIUrl: process.env.OMNIVORE_API_URL === undefined ? "" : process.env.OMNIVORE_API_URL,
    serverUrl: process.env.URL === undefined ? "" : process.env.URL,
};