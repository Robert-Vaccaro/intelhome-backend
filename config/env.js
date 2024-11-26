const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    mongoDd: process.env.MONGO_DB === undefined ? "" : process.env.MONGO_DB,
    twilioSid: process.env.TWILIO_SID === undefined ? "" : process.env.TWILIO_SID,
    twilioToken: process.env.TWILIO_TOKEN === undefined ? "" : process.env.TWILIO_TOKEN,
    twilioPhone: process.env.TWILIO_PHONE === undefined ? "" : process.env.TWILIO_PHONE,
    email: process.env.EMAIL === undefined ? "" : process.env.EMAIL,
    pw: process.env.PW === undefined ? "" : process.env.PW,
    key: process.env.KEY === undefined ? "" : process.env.KEY,
    iv: process.env.IV === undefined ? "" : process.env.IV,
    jwtKey: process.env.JWT_KEY === undefined ? "" : process.env.JWT_KEY,
    secretPassword: process.env.SECRET_PW === undefined ? "" : process.env.SECRET_PW,
    demoId: process.env.DEMO_ID === undefined ? "" : process.env.DEMO_ID,
    openAiSecretKey: process.env.OPENAI_SKEY === undefined ? "" : process.env.OPENAI_SKEY,
    openAiPublicKey: process.env.OPENAI_PKEY === undefined ? "" : process.env.OPENAI_PKEY,
    apnKey: process.env.APN_KEY === undefined ? "" : process.env.APN_KEY,
    appleKeyId: process.env.APPLE_KEY_ID === undefined ? "" : process.env.APPLE_KEY_ID,
    appleTeamId: process.env.APPLE_TEAM_ID === undefined ? "" : process.env.APPLE_TEAM_ID,
    appleTopic: process.env.APPLE_TOPIC === undefined ? "" : process.env.APPLE_TOPIC,
};