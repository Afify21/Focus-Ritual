const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const User = require('../models/User');

/**
 * Authentication middleware to verify JWT tokens
 */
exports.authenticate = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, authConfig.jwt.secret);
        
        // Add user ID to request
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Invalid token' });
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