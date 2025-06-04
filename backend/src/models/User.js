const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: false
    },
    preferences: {
        theme: {
            type: String,
            default: 'light'
        },
        notificationsEnabled: {
            type: Boolean,
            default: true
        },
        focusSessionDefaults: {
            duration: {
                type: Number,
                default: 25 // minutes
            },
            breakDuration: {
                type: Number,
                default: 5 // minutes
            }
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema); 