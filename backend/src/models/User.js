const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const authConfig = require('../config/auth');

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
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: authConfig.password.minLength
    },
    emailVerified: {
        type: Boolean,
        default: !authConfig.emailVerification.required
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
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

// Pre-save hook to hash password before saving to database
UserSchema.pre('save', async function(next) {
    // Only hash the password if it's modified or new
    if (!this.isModified('password')) return next();
    
    try {
        // Generate salt and hash password
        const salt = await bcrypt.genSalt(authConfig.password.saltRounds);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema); 