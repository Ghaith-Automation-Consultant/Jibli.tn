const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: [80, 'Le nom ne peut pas dépasser 80 caractères'] },
    location: { type: String, maxlength: [120, 'La localisation ne peut pas dépasser 120 caractères'] },
    avatar: { type: String, maxlength: [2048, "L'URL de la photo est trop longue"] },
    bio: { type: String, maxlength: [500, 'La bio ne peut pas dépasser 500 caractères'] },
    phone: { type: String, maxlength: [30, 'Le numéro de téléphone est trop long'] },
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
    // Keep _id alongside the id virtual: the frontend reads _id on populated documents.
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

