require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const audioRoutes = require('./routes/audioRoutes');
const chatRoutes = require('./routes/chatRoutes');
const habitRoutes = require('./routes/habitRoutes');
const personalizationRoutes = require('./routes/personalizationRoutes');
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./config/database');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Add your frontend URLs
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// Connect to MongoDB
connectDB()
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: err.message
    });
});

// Serve static files from the public directory
app.use('/audio', express.static(path.join(__dirname, '../public/audio')));

// Routes
app.use('/api/audio', audioRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/personalization', personalizationRoutes);
app.use('/api/auth', authRoutes);

// Start server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Please open http://localhost:${PORT} in your browser`);
}); 