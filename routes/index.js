const router = require('express').Router();
const { credCheck, signIn, register, phoneCode, emailCode, refreshToken, checkPhoneCode, checkEmailCode } = require('../controllers/index.js');
const authMiddleware = require('../middleware/auth.middleware.js');

router.get('/', (req, res) => {
    res.render('index', { title: 'PayTab' });
  });
router.post('/refresh-token', authMiddleware, refreshToken);
router.post('/cred-check', authMiddleware, credCheck);
router.post('/sign-in', signIn);
router.post('/register', register);
router.post('/phone-code', authMiddleware, phoneCode);
router.post('/check-phone-code', authMiddleware, checkPhoneCode);
router.post('/check-email-code', authMiddleware, checkEmailCode);
router.post('/email-code', authMiddleware, emailCode);

module.exports = router;