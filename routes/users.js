const router = require('express').Router();
const { earlyAccess, unsubscribeEarlyAccess, saveCard, getCards, deleteCard } = require('../controllers/user.js');
const authMiddleware = require('../middleware/auth.middleware.js');

// router.post('/test',  userController.register);
router.get('/payment-methods', getCards);
router.post('/default-card', saveCard);
router.delete('/card', deleteCard);
router.post('/save-card', saveCard);
router.post('/early-access', earlyAccess);
router.get('/unsubscribe-early-access', unsubscribeEarlyAccess);
module.exports = router;