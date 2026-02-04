const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
    try {
        const { receiverId, content } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({ error: 'Receiver ID and content are required' });
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ error: 'Utilisateur destinataire non trouvé' });
        }

        const message = await Message.create({
            sender: req.user.id,
            receiver: receiverId,
            content
        });

        // Initialize user object to return populated data if needed, or just return the message
        // Ideally populate sender and receiver names for immediate UI update
        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name')
            .populate('receiver', 'name');

        res.status(201).json(populatedMessage);
    } catch (err) {
        next(err);
    }
};

// @desc    Get all conversations for current user (grouped by other user)
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
    try {
        // This aggregation is complex to group by conversation partner.
        // For MVP/Simplicity, we can fetch all messages involving the user and group them in JS, 
        // or just fetch unique users communicated with.

        // Let's fetch the latest message for each conversation partner.
        // Strategy: Find all messages where currentUser is sender OR receiver.
        // Then group by the other person ID.

        const userId = new mongoose.Types.ObjectId(req.user.id);

        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { receiver: userId }]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$sender", userId] },
                            "$receiver",
                            "$sender"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'partner'
                }
            },
            {
                $unwind: '$partner'
            },
            {
                $project: {
                    'partner.password': 0, // Exclude password
                    'partner.__v': 0
                }
            },
            {
                $sort: { 'lastMessage.createdAt': -1 }
            }
        ]);

        res.status(200).json(conversations);
    } catch (err) {
        next(err);
    }
};

// @desc    Get messages with a specific user
// @route   GET /api/messages/:userId
// @access  Private
exports.getMessages = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId }
            ]
        })
            .sort({ createdAt: 1 }) // Oldest first for chat history
            .populate('sender', 'name')
            .populate('receiver', 'name');

        res.status(200).json(messages);
    } catch (err) {
        next(err);
    }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/:userId/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
    try {
        const { userId } = req.params; // The other user ID
        const currentUserId = req.user.id;

        await Message.updateMany(
            { sender: userId, receiver: currentUserId, read: false },
            { $set: { read: true } }
        );

        res.status(200).json({ success: true });
    } catch (err) {
        next(err);
    }
};

const mongoose = require('mongoose');
