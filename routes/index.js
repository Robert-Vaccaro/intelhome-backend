const router = require('express').Router();
const { credCheck, signIn, register, phoneVerification, phoneCode, emailVerification, emailCode, refreshToken, checkPhoneCode } = require('../controllers/index.js');
const authMiddleware = require('../middleware/auth.middleware.js');

router.get('/', (req, res) => {
    res.render('index', { title: 'PayTab' });
  });
router.post('/refresh-token', authMiddleware, refreshToken);
router.post('/cred-check', authMiddleware, credCheck);
router.post('/sign-in', signIn);
router.post('/register', register);
router.post('/check-phone-code', checkPhoneCode);
router.post('/phone-verification', authMiddleware, phoneVerification);
router.post('/phone-code', authMiddleware, phoneCode);
router.post('/email-verification', authMiddleware, emailVerification);
router.post('/email-code', authMiddleware, emailCode);

module.exports = router;
