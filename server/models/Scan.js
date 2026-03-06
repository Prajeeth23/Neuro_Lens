const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    file_url: {
        type: String,
        required: true
    },
    file_type: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    original_name: {
        type: String,
        required: true
    },
    prediction: {
        type: String,
        enum: ['REAL', 'FAKE'],
        default: null
    },
    confidence_score: {
        type: Number,
        default: null
    },
    ai_probability: {
        type: Number,
        default: null
    },
    explanation: {
        type: String,
        default: null
    },
    regions: {
        type: Array,
        default: []
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Scan', scanSchema);
