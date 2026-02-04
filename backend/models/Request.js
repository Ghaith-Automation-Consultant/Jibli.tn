const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    item: { type: String, required: true },
    description: { type: String },
    location: { type: String, required: true },
    weight: { type: Number },
    budget: { type: Number },
    status: { type: String, enum: ['pending', 'accepted', 'completed', 'cancelled'], default: 'pending' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true
});

requestSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

requestSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id }
});

module.exports = mongoose.model('Request', requestSchema);
