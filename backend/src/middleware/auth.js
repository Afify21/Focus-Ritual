const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const User = require('../models/User');

/**
 * Authentication middleware to verify JWT tokens
 */
exports.authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No authentication token, access denied' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, authConfig.jwt.secret);
        
        // Find user by ID
        const user = await User.findOne({ userId: decoded.userId });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Check if email verification is required
        if (authConfig.emailVerification.required && !user.emailVerified) {
            return res.status(403).json({ error: 'Email not verified, please verify your email address' });
        }
        
        // Add user object to request
        req.user = user;
        req.userId = user.userId;
        
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ error: 'Invalid token, authentication failed' });
    }
};

/**
 * Optional authentication middleware
 * Will set req.user if token is valid, but won't reject if no token is provided
 */
exports.optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return next();
        }
        
        const decoded = jwt.verify(token, authConfig.jwt.secret);
        const user = await User.findOne({ userId: decoded.userId });
        
        if (user) {
            req.user = user;
            req.userId = user.userId;
        }
        
        next();
    } catch (error) {
        // Continue even if token is invalid
        next();
    }
}; 