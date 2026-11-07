const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, "Le contenu du message est requis"],
        trim: true,
        maxlength: [1000, "Le message ne peut pas dépasser 1000 caractères"]
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries on conversations
MessageSchema.index({ sender: 1, receiver: 1 });
MessageSchema.index({ receiver: 1, sender: 1 });
MessageSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Message || mongoose.model('Message', MessageSchema);

