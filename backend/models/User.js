const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    location: { type: String },
    avatar: { type: String },
    bio: { type: String },
    phone: { type: String },
    languages: [{ type: String }],
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isIdentityVerified: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
    reviews: [{
        rating: Number,
        comment: String,
        authorName: String,
        authorId: { type: String }, // Store ID as string for now to avoid ref complexity with light models
        createdAt: { type: Date, default: Date.now }
    }],
}, {
    timestamps: true
});

// Duplicate the ID field.
userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialized.
userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id }
});

module.exports = mongoose.model('User', userSchema);
