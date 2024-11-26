const Users = require('../schemas/users');

exports.addLocation = async (req, res) => {
    try {
        const userId = req.decodedUserId
        const { location } = req.body;
        const user = await Users.findOne({ userId });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
        }
        user.locations.push(location)
        await user.save()
        return res.status(200).json({ message: 'Success', user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};

exports.updateLocationName = async (req, res) => {
    try {
        const userId = req.decodedUserId;
        const { oldLocation, newLocation } = req.body;
        const user = await Users.findOne({ userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const locationIndex = user.locations.indexOf(oldLocation);
        if (locationIndex === -1) {
            return res.status(404).json({ error: 'Location not found' });
        }

        user.locations[locationIndex] = newLocation; // Update the location
        await user.save();

        return res.status(200).json({ message: 'Location updated successfully', locations: user.locations });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};

exports.replaceLocations = async (req, res) => {
    try {
        const userId = req.decodedUserId;
        const { newLocations } = req.body; // `newLocations` is the new array
        const user = await Users.findOne({ userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.locations = newLocations; // Replace the entire array
        await user.save();

        return res.status(200).json({ message: 'Locations replaced successfully', locations: user.locations });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};

exports.deleteLocation = async (req, res) => {
    try {
        const userId = req.decodedUserId;
        const { location } = req.body;
        const user = await Users.findOne({ userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const locationIndex = user.locations.indexOf(location);
        if (locationIndex === -1) {
            return res.status(404).json({ error: 'Location not found' });
        }

        user.locations.splice(locationIndex, 1); // Remove the location
        await user.save();

        return res.status(200).json({ message: 'Location deleted successfully', locations: user.locations });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
};
