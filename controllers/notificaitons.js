const Notifications = require('../schemas/notifications');
const Devices = require('../schemas/devices');
const Users = require('../schemas/users');
const { sendPushNotification } = require('../logic/notificaitons');
const { Types } = require('mongoose');
const schedule = require('node-schedule');
const sendSms = require('../logic/twilio');
const { sendEmailNotifications } = require('../logic/email');

// Get all notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.decodedUserId; // Get userId from the request (e.g., decoded token)
    // Query by both device ID and userId
    const notificaitons = await Notifications.find({ userId: userId });
    if (!notificaitons) {
      return res.status(404).json({ message: 'Device not found' });
    }

    res.status(200).json(notificaitons);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server Error" });
}
};

// Delete a single notification by ID
exports.deleteNotificationById = async (req, res) => {
  try {
    const { id } = req.body; // Get the notification ID from request params

    // Use findByIdAndDelete to remove the specific notification
    const notification = await Notifications.findByIdAndDelete(new Types.ObjectId(String(id)));

    if (!notification) {
      return res.status(204).json({ message: 'No Notification' });
    }

    res.status(200).json({ 
      message: 'Notification deleted successfully' 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server Error" });
}
};


// Delete all notifications
exports.deleteNotifications = async (req, res) => {
  try {
    const userId = req.decodedUserId;
    const result = await Notifications.deleteMany({userId});
    res.status(200).json({ 
      message: 'All notifications deleted successfully'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server Error" });
}
};

const checkAllDevicesForUpdates = async () => {
  try {
    console.log('Running device check at:', new Date().toISOString());

    // Step 1: Fetch all devices with `needsUpdate: true` and group by userId
    const devicesToUpdate = await Devices.find({ needsUpdate: true });
    const devicesByUser = devicesToUpdate.reduce((acc, device) => {
      if (!acc[device.userId]) acc[device.userId] = [];
      acc[device.userId].push(device);
      return acc;
    }, {});

    // Step 2: Fetch all users who have devices needing updates
    const userIds = Object.keys(devicesByUser);
    const users = await Users.find({ _id: { $in: userIds } });

    // Step 3: Process notifications for each user
    for (const user of users) {
      const userDevices = devicesByUser[user._id];

      // Consolidate notification message
      const numOfDevices = userDevices.length;
      const pushMsgStr = numOfDevices > 1
        ? `You have ${numOfDevices} devices with updates available!`
        : `You have a device with an update available!`;

      const generalMsgStr = userDevices.map(
        (device) => `- "${device.name}" at "${device.location}"`
      ).join('\n');

      const fullMsgStr = `${pushMsgStr}\n\n${generalMsgStr}`;

      // Check user's notification preferences and send one notification
      if (user.pushNotifications) {
        sendPushNotification(user.DTString, pushMsgStr);
      }
      if (user.textNotifications) {
        sendSms(user.phone, fullMsgStr);
      }
      if (user.emailNotifications) {
        sendEmailNotifications(user.email, userDevices);
      }

      // Save a single notification for this user summarizing all devices
      const notification = new Notifications({
        userId: user._id,
        deviceId:  userDevices[0]._id,
        message: fullMsgStr,
      });
      await notification.save();
    }
  } catch (error) {
    console.error('Error during device check:', error);
  }
};


exports.startDeviceCheck = async () => {
  // Schedule the task for 5:30 PM PST/PDT
  const job = schedule.scheduleJob({ hour: 17, minute: 30, tz: 'America/Los_Angeles' }, async () => {
    console.log('Scheduled task triggered');
    await checkAllDevicesForUpdates();
  });
  console.log('Device check scheduled to run daily at 5:30 PM PST/PDT');
};

