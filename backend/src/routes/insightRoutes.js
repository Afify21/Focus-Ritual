const express = require('express');
const router = express.Router();
const PersonalizedInsightsService = require('../services/personalizedInsightsService');

const insightsService = new PersonalizedInsightsService();

// Generate focus insights
router.post('/focus', async (req, res) => {
    try {
        const { focusSessions, habits } = req.body;
        const insights = await insightsService.generateFocusInsights({
            focusSessions,
            habits
        });

        if (!insights.success) {
            return res.status(500).json({ error: insights.error });
        }

        res.json({ insights: insights.insights });
    } catch (error) {
        console.error('Error generating insights:', error);
        res.status(500).json({ error: 'Failed to generate insights' });
    }
});

module.exports = router; 