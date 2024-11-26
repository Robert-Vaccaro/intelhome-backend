const express = require('express');
const {
  getDevices,
  getDeviceById,
  createDevice,
  deleteDevice,
  saveDevice,
  updateDevice
} = require('../controllers/devices');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Get all devices (with optional location filter)
router.get('/', authMiddleware, getDevices); 

// Get a single device by ID (must belong to authenticated user)
router.get('/:id', authMiddleware, getDeviceById); 

// Create a new device (authenticated user only)
router.post('/', authMiddleware, createDevice); 

router.post('/save', authMiddleware, saveDevice); 

// Update a device by ID (must belong to authenticated user)
router.put('/update', authMiddleware, updateDevice); 

// Delete a device by ID (must belong to authenticated user)
router.delete('/', authMiddleware, deleteDevice); 

module.exports = router;
