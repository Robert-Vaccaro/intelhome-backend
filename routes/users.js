const router = require('express').Router();
const { earlyAccess, unsubscribeEarlyAccess, saveCard, getCards, deleteCard, saveLocation, defaultCard } = require('../controllers/user.js');
const authMiddleware = require('../middleware/auth.middleware.js');

// router.post('/test',  userController.register);
router.get('/payment-methods', authMiddleware, getCards);
router.post('/default-card', authMiddleware, defaultCard);
router.post('/save-card', authMiddleware, saveCard);
router.delete('/card', authMiddleware, deleteCard);
router.post('/save-location', authMiddleware, saveLocation);
router.post('/early-access', earlyAccess);
router.get('/unsubscribe-early-access', unsubscribeEarlyAccess);
module.exports = router;