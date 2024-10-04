const router = require('express').Router();
const indexController = require('../controllers/index.js');
const authMiddleware = require('../middleware/auth.middleware.js');

router.post('/test',  indexController.test);

module.exports = router;