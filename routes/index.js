const express = require('express');
const router = express.Router();

// Render the index.jade view with a title
router.get('/', (req, res) => {
    res.render('index', { title: "IntelHome Server", message: "Welcome to the IntelHome Server!" });
});

module.exports = router;