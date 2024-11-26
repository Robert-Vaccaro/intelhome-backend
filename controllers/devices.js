const { Types } = require('mongoose');
const { generateDeviceJson } = require('../logic/device');
const Devices = require('../schemas/devices');
const moment = require('moment-timezone');
const { sendPushNotification } = require('../logic/notificaitons');

// Get all devices with optional location and userId filters
exports.getDevices = async (req, res) => {
  try {
    let filter = req.query.filter; // Get the location filter query parameter
    const userId = req.decodedUserId; // Get the userId from the request (e.g., decoded token)
    if (filter === "All") {filter = ""}
    // Build the query
    const query = {
      userId: userId, // Always filter by userId
      ...(filter && { location: { $regex: filter, $options: "i" } }) // Add location filter if provided
    };
    
    // Find devices and format _id as a string
    let devices = await Devices.find(query)
      .select("_id name type detectedAt needsUpdate")
      .lean() // Convert Mongoose documents to plain JS objects
      .exec();
    
    // Transform _id to a string
    devices = devices.map(device => ({
      ...device,
      _id: device._id.toString()
    }));
    res.status(200).json(devices);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server Error" });
}
};

// Get a single device by ID and userId
exports.getDeviceById = async (req, res) => {
  try {
    const userId = req.decodedUserId; // Get userId from the request (e.g., decoded token)
    const deviceId = req.params.id; // Get device ID from the request params

    // Query by both device ID and userId
    const device = await Devices.findOne({ _id: new Types.ObjectId(String(deviceId)), userId: userId });

    if (!device) {
      return res.status(404).json({ message: 'Device not found or unauthorized' });
    }

    res.status(200).json(device);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server Error" });
}
};

// Create a new device
exports.createDevice = async (req, res) => {
  try {
    const { name } = req.body;

    // Generate the device JSON from GPT
    const generatedDeviceObj = await generateDeviceJson(name);
    const newDevice = JSON.parse(generatedDeviceObj);

    // Add additional fields to the parsed object
    newDevice.userId = req.decodedUserId.toString(); // Ensure userId is a string
    newDevice.detectedAt = moment(moment().tz(moment.tz.guess())).unix(); // Add current timestamp
    newDevice.needsUpdate = Math.random() < 0.5; // 50% chance of being true or false

    res.status(200).json({ message: "Device saved successfully", device: newDevice });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server Error" });
}
};

exports.saveDevice = async (req, res) => {
  try {
    const {
      userId,
      name,
      type,
      location,
      capabilities,
      specifications,
      detectedAt,
      needsUpdate,
    } = req.body;

    // Validate required fields
    if (!userId || !name || !type || !location || !capabilities || !specifications || detectedAt === undefined || needsUpdate === undefined) {
      return res.status(400).json({ error: "Invalid or missing device fields" });
    }

    // Create a new device document
    const newDevice = new Devices({
      userId,
      name,
      type,
      location,
      capabilities,
      specifications,
      detectedAt,
      needsUpdate,
    });

    await newDevice.save();

    res.status(200).json({ message: "Device saved successfully", device: newDevice });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server Error" });
}
};


// Update only the needsUpdate field for a device by ID
exports.updateDevice = async (req, res) => {
  try {
    // Check if at least one of the fields is provided
    const { deviceId, needsUpdate, location } = req.body;
    if (needsUpdate === undefined && !location) {
      return res.status(400).json({ message: "Either 'needsUpdate' or 'location' field is required" });
    }
    // Build the update data object dynamically
    const updateData = {};
    if (needsUpdate !== undefined) {
      updateData.needsUpdate = needsUpdate;
    }
    if (location) {
      updateData.location = location;
    }

    // Find and update the device
    const device = await Devices.findOneAndUpdate(
      { _id: new Types.ObjectId(String(deviceId)), userId: req.decodedUserId }, // Ensure the user owns the device
      updateData, // Update only the provided fields
      { new: true } // Return the updated document
    );

    if (!device) {
      return res.status(404).json({ message: 'Device not found or unauthorized' });
    }

    res.status(200).json({ message: 'Device updated successfully', device });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server Error" });
}
};



// Delete a device by ID
exports.deleteDevice = async (req, res) => {
  try {
    const device = await Devices.findOneAndDelete({ _id: new Types.ObjectId(String(req.body.deviceId)), userId: req.decodedUserId });
    if (!device) return res.status(404).json({ message: 'Device not found' });
    res.status(200).json({ message: 'Device deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server Error" });
}
};

