const env = require('../config/env');
const { twilioSid, twilioToken, twilioPhone } = env;
const client = require('twilio')(twilioSid, twilioToken);

async function sendSms(phoneNumber, code) {
    try {
        const message = await client.messages.create({
            body: `Your PayTab verification code is: ${code}`,
            to: phoneNumber, 
            from: twilioPhone
        });

        console.log(`Message sent with SID: ${message.sid}`);
        return message.sid;
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw error;
    }
}

module.exports = sendSms;
