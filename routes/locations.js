const express = require('express');
const { updateLocationName, replaceLocations, deleteLocation } = require('../controllers/locations');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

router.put('/update', authMiddleware, updateLocationName); // Update a specific location
router.put('/replace', authMiddleware, replaceLocations); // Replace the entire locations array
router.delete('/delete', authMiddleware, deleteLocation); // Delete a specific location

module.exports = router;