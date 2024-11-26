const apn = require("apn");
const env = require("../config/env");

const path = require("path");

const apnProvider = new apn.Provider({
  token: {
    key: path.resolve(__dirname, "../cert_key2.p8").replace(/\\n/gm, '\n'), // Absolute path to the .p8 file
    keyId: env.appleKeyId, // Key ID from Apple Developer account
    teamId: env.appleTeamId, // Team ID from Apple Developer account
  },
  production: false, // Set to `true` for production
});

// Function to send a push notification
exports.sendPushNotification = async (deviceToken, message) => {
  const notification = new apn.Notification({
    alert: message,
    topic: env.appleTopic,
    sound: "default",
    badge: 1,
  });

  try {
    const result = await apnProvider.send(notification, deviceToken);
    console.log("Push notification sent", );
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};
