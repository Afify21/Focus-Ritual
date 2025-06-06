const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const authConfig = require('../config/auth');

/**
 * Register a new user
 */
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        
        // Create new user
        const newUser = new User({
            userId: uuidv4(),
            name,
            email,
            password,
            preferences: {
                theme: 'light',
                notificationsEnabled: true,
                focusSessionDefaults: {
                    duration: 25,
                    breakDuration: 5
                }
            }
        });
        
        // Save user to database
        await newUser.save();
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser.userId },
            authConfig.jwt.secret,
            { expiresIn: authConfig.jwt.expiresIn }
        );
        
        // Return user data (without password) and token
        res.status(201).json({
            user: {
                userId: newUser.userId,
                name: newUser.name,
                email: newUser.email,
                emailVerified: newUser.emailVerified,
                preferences: newUser.preferences,
                createdAt: newUser.createdAt
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Error registering user' });
    }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Check if email verification is required
        if (authConfig.emailVerification.required && !user.emailVerified) {
            return res.status(403).json({ error: 'Email not verified, please verify your email' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user.userId },
            authConfig.jwt.secret,
            { expiresIn: authConfig.jwt.expiresIn }
        );
        
        // Update last active timestamp
        user.lastActive = Date.now();
        await user.save();
        
        // Return user data and token
        res.json({
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified,
                preferences: user.preferences,
                createdAt: user.createdAt,
                lastActive: user.lastActive
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error during login' });
    }
};

/**
 * Get current user data
 */
exports.getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Find user by ID
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Return user data (without password)
        res.json({
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified,
                preferences: user.preferences,
                createdAt: user.createdAt,
                lastActive: user.lastActive
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Error fetching user data' });
    }
};

/**
 * Request password reset
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            // For security reasons, don't reveal if the email exists
            return res.json({ message: 'If your email is registered, you will receive a password reset link' });
        }
        
        // Generate reset token
        const resetToken = uuidv4();
        
        // Set token expiration (1 hour)
        const resetExpires = Date.now() + 3600000;
        
        // Save token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;
        await user.save();
        
        // In a real application, you would send an email with the reset link
        // For this demo, we'll just return the token
        res.json({ 
            message: 'If your email is registered, you will receive a password reset link',
            // Only include token in development, remove in production
            resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Error processing password reset request' });
    }
};

/**
 * Reset password with token
 */
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        // Find user with this token and valid expiration
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
        }
        
        // Set new password
        user.password = newPassword;
        
        // Clear reset token fields
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        
        // Save user
        await user.save();
        
        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Error resetting password' });
    }
}; 