const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    from: { type: String, required: true, trim: true, maxlength: [100, 'La ville de départ est trop longue'] },
    to: { type: String, required: true, trim: true, maxlength: [100, "La ville d'arrivée est trop longue"] },
    departureDate: { type: Date, required: true },
    arrivalDate: { type: Date },
    maxWeight: { type: Number, required: true },
    size: { type: String, enum: ['S', 'M', 'L', 'XL'], default: 'M' },
    priceType: { type: String, enum: ['free', 'paid'], default: 'free' },
    price: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true
});

// Public search: active trips from today on, sorted by departure. Dashboard: one user's trips.
tripSchema.index({ status: 1, departureDate: 1 });
tripSchema.index({ user: 1, departureDate: 1 });

tripSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

tripSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    // Keep _id alongside the id virtual: the frontend reads _id on populated documents.
});

module.exports = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
