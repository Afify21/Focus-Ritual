require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const audioRoutes = require('./routes/audioRoutes');
const chatRoutes = require('./routes/chatRoutes');
const habitRoutes = require('./routes/habitRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

// Start server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Please open http://localhost:${PORT} in your browser`);
}); 