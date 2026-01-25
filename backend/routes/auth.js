const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateUser } = require('../middleware/validation');

router.post('/login', validateUser, authController.login);
router.post('/register', validateUser, authController.register);

module.exports = router;
