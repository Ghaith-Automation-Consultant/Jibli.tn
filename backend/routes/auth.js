const express = require('express');
const { register, login, refresh, logout } = require('../controllers/auth');
const { loginLimiter, apiLimiter } = require('../config/rateLimit');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// Public routes with specific rate limits
router.post('/register', apiLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/refresh', apiLimiter, refresh);

// Protected route to logout securely
router.post('/logout', authenticateToken, logout);

// Sample protected route to test auth
router.get('/me', authenticateToken, (req, res) => {
    res.json({ message: 'Authentication successful', user: req.user });
});

module.exports = router;
