const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
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

tripSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

tripSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id }
});

module.exports = mongoose.model('Trip', tripSchema);
