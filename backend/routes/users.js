const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/auth');

// Me routes (must be before /:id)
router.put('/me/password', authenticateToken, userController.changePassword);
router.get('/me', authenticateToken, userController.getMe);
router.put('/me', authenticateToken, userController.updateMe);

// Reuse authController functions for user management
router.get('/:id', authenticateToken, userController.getUser);
router.put('/:id', authenticateToken, userController.updateUser);
router.delete('/:id', authenticateToken, userController.deleteUser);

module.exports = router;
