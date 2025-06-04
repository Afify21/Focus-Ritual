const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 * @returns {Promise} A promise that resolves when connected
 */
const connectDB = async () => {
    try {
        // Get MongoDB URI from environment variable or use default
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/focus-ritual';
        
        // Connect to MongoDB
        const conn = await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB; 