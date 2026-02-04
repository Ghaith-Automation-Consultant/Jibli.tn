const express = require('express');
const router = express.Router();
const { verifyToken: protect } = require('../middleware/auth'); // Alias verifyToken as protect to match expected usage
const {
    sendMessage,
    getConversations,
    getMessages,
    markAsRead
} = require('../controllers/messageController');

router.use(protect); // All routes are protected

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/:userId', getMessages);
router.put('/:userId/read', markAsRead);

module.exports = router;
