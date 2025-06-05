/**
 * Authentication configuration settings
 */
module.exports = {
    // JWT settings
    jwt: {
        secret: process.env.JWT_SECRET || 'focus-ritual-super-secret-key-change-in-production',
        expiresIn: '7d', // Token expires in 7 days
        refreshExpiresIn: '30d' // Refresh token expires in 30 days
    },
    
    // Password settings
    password: {
        saltRounds: 10, // Number of salt rounds for bcrypt
        minLength: 8 // Minimum password length
    },
    
    // Email verification
    emailVerification: {
        required: false, // Set to true to require email verification
        tokenExpiration: '24h' // Email verification token expiration
    }
}; 