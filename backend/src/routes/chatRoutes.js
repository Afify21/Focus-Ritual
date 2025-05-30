const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

router.post('/', async (req, res) => {
    try {
        const { message } = req.body;

        // Create chat context
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "You are a helpful study assistant. Your role is to help students with their studies by providing clear, accurate, and concise explanations. You should focus on educational content and maintain a professional, encouraging tone." }],
                },
                {
                    role: "model",
                    parts: [{ text: "I understand. I will act as a helpful study assistant, providing clear and accurate explanations while maintaining a professional and encouraging tone. I'll focus on educational content and help students understand their subjects better." }],
                },
            ],
        });

        // Send message and get response
        const result = await chat.sendMessage(message);
        const response = result.response.text();

        res.json({ response });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ 
            error: 'Failed to process chat request',
            details: error.message 
        });
    }
});

module.exports = router; 