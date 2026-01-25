const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Reuse authController functions for user management
router.get('/:id', authController.getUser);
router.put('/:id', verifyToken, authController.updateUser);
router.delete('/:id', verifyToken, authController.deleteUser);

module.exports = router;
