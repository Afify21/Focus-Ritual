const mongoose = require('mongoose');

const UserBehaviorSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: 'User',
        required: true
    },
    focusSessions: [{
        startTime: Date,
        endTime: Date,
        plannedDuration: Number, // in minutes
        actualDuration: Number, // in minutes
        completed: Boolean,
        distractions: [{
            time: Date,
            type: String, // 'manual', 'external', 'internal'
            description: String
        }],
        mood: {
            before: {
                type: Number, // 1-5 scale
                default: null
            },
            after: {
                type: Number, // 1-5 scale
                default: null
            }
        },
        productivity: {
            type: Number, // 1-5 scale
            default: null
        },
        tags: [String],
        notes: String
    }],
    habits: [{
        habitId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        name: String,
        completionHistory: [{
            date: Date,
            completed: Boolean
        }],
        streak: {
            current: Number,
            best: Number
        }
    }],
    contextData: [{
        date: {
            type: Date,
            default: Date.now
        },
        timeOfDay: String,
        deviceType: String,
        location: String,
        activityBefore: String,
        activityAfter: String
    }]
});

// Add indexes for faster querying
UserBehaviorSchema.index({ userId: 1 });
UserBehaviorSchema.index({ 'focusSessions.startTime': -1 });

module.exports = mongoose.model('UserBehavior', UserBehaviorSchema); 