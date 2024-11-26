const env = require('../config/env');
const { twilioSid, twilioToken, twilioPhone } = env;
const client = require('twilio')(twilioSid, twilioToken);

async function sendSms(phoneNumber, body) {
    try {
        const message = await client.messages.create({
            body: body,
            to: phoneNumber, 
            from: twilioPhone
        });
        return message.sid;
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw error;
    }
}
module.exports = sendSms;
