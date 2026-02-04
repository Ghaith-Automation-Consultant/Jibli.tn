const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, optionalAuth } = require('../middleware/auth');

// Me routes (must be before /:id)
router.get('/me', verifyToken, authController.getMe);
router.put('/me', verifyToken, authController.updateMe);

// Reuse authController functions for user management
router.get('/:id', optionalAuth, authController.getUser);
router.put('/:id', verifyToken, authController.updateUser);
router.delete('/:id', verifyToken, authController.deleteUser);

module.exports = router;
