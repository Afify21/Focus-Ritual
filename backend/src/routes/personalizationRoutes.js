const express = require('express');
const router = express.Router();
const userBehaviorController = require('../controllers/userBehaviorController');
const personalizationEngine = require('../services/personalizationEngine');
const personalizedInsightsService = require('../services/personalizedInsightsService');
const UserBehavior = require('../models/UserBehavior');

// Track focus session data
router.post('/track-session', userBehaviorController.trackFocusSession);

// Get user analytics
router.get('/analytics/:userId', userBehaviorController.getUserAnalytics);

// Update context data
router.post('/context', userBehaviorController.updateContextData);

// Get optimized focus settings based on user behavior
router.get('/focus-settings/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        const settings = await personalizationEngine.getOptimizedFocusSettings(userId);
        
        res.status(200).json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('Error getting optimized focus settings:', error);
        res.status(500).json({ error: 'Failed to get focus settings' });
    }
});

// Get optimal focus time recommendation
router.get('/optimal-time/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        const timeRecommendation = await personalizationEngine.getOptimalFocusTime(userId);
        
        res.status(200).json({
            success: true,
            recommendation: timeRecommendation
        });
    } catch (error) {
        console.error('Error getting optimal focus time:', error);
        res.status(500).json({ error: 'Failed to get optimal focus time' });
    }
});

// Get personalized insights for the user
router.get('/insights/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        // Get user data from database
        const userBehavior = await UserBehavior.findOne({ userId });
        
        if (!userBehavior) {
            return res.status(404).json({ error: 'User behavior data not found' });
        }
        
        // Generate personalized insights
        const insightsResult = await personalizedInsightsService.generateFocusInsights({
            focusSessions: userBehavior.focusSessions || [],
            habits: userBehavior.habits || [],
            contextData: userBehavior.contextData || []
        });
        
        if (!insightsResult.success) {
            return res.status(500).json({ error: insightsResult.error });
        }
        
        res.status(200).json({
            success: true,
            insights: insightsResult.insights
        });
    } catch (error) {
        console.error('Error getting personalized insights:', error);
        res.status(500).json({ error: 'Failed to get personalized insights' });
    }
});

// Get personalized habit recommendations
router.post('/habit-recommendations', async (req, res) => {
    try {
        const { userId, goals } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        // Get user data from database
        const userBehavior = await UserBehavior.findOne({ userId });
        
        if (!userBehavior) {
            return res.status(404).json({ error: 'User behavior data not found' });
        }
        
        // Generate habit recommendations
        const recommendationResult = await personalizedInsightsService.generateHabitRecommendations({
            habits: userBehavior.habits || [],
            focusSessions: userBehavior.focusSessions || [],
            goals: goals || 'improve focus and productivity'
        });
        
        if (!recommendationResult.success) {
            return res.status(500).json({ error: recommendationResult.error });
        }
        
        res.status(200).json({
            success: true,
            recommendation: recommendationResult.recommendation
        });
    } catch (error) {
        console.error('Error getting habit recommendations:', error);
        res.status(500).json({ error: 'Failed to get habit recommendations' });
    }
});

module.exports = router;