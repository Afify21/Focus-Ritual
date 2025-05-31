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
        console.log('Received chat request:', req.body);
        const { message, history } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is not set in environment variables');
            return res.status(500).json({
                error: 'AI configuration error',
                details: 'AI service is not properly configured'
            });
        }

        // Use the provided history if available, otherwise use the default initial prompt
        const chatHistory = history && history.length > 0 ? history : [
            {
                role: "user",
                parts: [{ text: "You are a helpful study assistant. Your role is to help students with their studies by providing clear, accurate, and concise explanations. You should focus on educational content and maintain a professional, encouraging tone." }],
            },
            {
                role: "model",
                parts: [{ text: "I understand. I will act as a helpful study assistant, providing clear and accurate explanations while maintaining a professional and encouraging tone. I'll focus on educational content and help students understand their subjects better." }],
            },
        ];

        console.log('Starting chat with history:', chatHistory);
        const chat = model.startChat({
            history: chatHistory,
        });

        console.log('Sending message to Gemini:', message);
        const result = await chat.sendMessage(message);
        const response = result.response.text();
        console.log('Received response from Gemini:', response);

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