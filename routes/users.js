const router = require('express').Router();
const { earlyAccess, unsubscribeEarlyAccess } = require('../controllers/user.js');
const authMiddleware = require('../middleware/auth.middleware.js');

// router.post('/test',  userController.register);

router.post('/early-access', earlyAccess);
router.get('/unsubscribe-early-access', unsubscribeEarlyAccess);
module.exports = router;