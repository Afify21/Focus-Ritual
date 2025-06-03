const express = require('express');
const router = express.Router();

// Import Google Generative AI (assuming it's set up in your project)
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google AI with your API key
// Note: In production, use environment variables for API keys
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-api-key');

router.post('/recommendation', async (req, res) => {
    try {
        const { habits, goals } = req.body;
        
        // Create a prompt based on the user's habits and goals
        let prompt = "Based on the following information, suggest 1-2 new habits that would complement the user's existing habits and help them achieve their goals. Provide a brief explanation for each suggestion. Format your response in plain text, focusing just on the recommendations. Keep it under 100 words total.";
        
        if (habits && habits.length > 0) {
            prompt += "\n\nCurrent habits:";
            habits.forEach(habit => {
                prompt += `\n- ${habit.name}${habit.streak ? ` (Current streak: ${habit.streak} days)` : ''}`;
            });
        } else {
            prompt += "\n\nThe user doesn't have any habits tracked yet.";
        }
        
        if (goals) {
            prompt += `\n\nUser's goals: ${goals}`;
        }
        
        // Get a response from Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        res.json({ 
            recommendation: text,
            success: true
        });
    } catch (error) {
        console.error('Error generating habit recommendation:', error);
        res.status(500).json({ 
            error: 'Failed to generate recommendation',
            success: false 
        });
    }
});

module.exports = router; 