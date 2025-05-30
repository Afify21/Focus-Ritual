const mongoose = require('mongoose');

const audioSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true,
        enum: ['nature', 'ambient', 'white-noise', 'music']
    },
    filePath: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Audio', audioSchema); 