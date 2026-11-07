const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    item: { type: String, required: true, trim: true, maxlength: [120, "Le nom de l'objet est trop long"] },
    description: { type: String, maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères'] },
    location: { type: String, required: true, trim: true, maxlength: [100, 'La destination est trop longue'] },
    weight: { type: Number },
    budget: { type: Number },
    status: { type: String, enum: ['pending', 'accepted', 'completed', 'cancelled'], default: 'pending' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true
});

// Public listing: open requests, newest first. Dashboard: one user's requests.
requestSchema.index({ status: 1, createdAt: -1 });
requestSchema.index({ user: 1, createdAt: -1 });

requestSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

requestSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    // Keep _id alongside the id virtual: the frontend reads _id on populated documents.
});

module.exports = mongoose.models.Request || mongoose.model('Request', requestSchema);

