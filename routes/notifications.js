const express = require('express');
const {
  getNotifications,
  deleteNotifications,
  deleteNotificationById
} = require('../controllers/notificaitons');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authMiddleware, getNotifications); // Get all notifications
router.delete('/', authMiddleware, deleteNotificationById);
router.delete('/all', authMiddleware, deleteNotifications); // Delete a notification

module.exports = router;
