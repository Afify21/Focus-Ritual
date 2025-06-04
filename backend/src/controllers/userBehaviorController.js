const User = require('../models/User');
const UserBehavior = require('../models/UserBehavior');

// Helper function for calculating focus session analytics
const calculateFocusAnalytics = (focusSessions) => {
    if (!focusSessions || focusSessions.length === 0) {
        return {
            totalSessions: 0,
            averageDuration: 0,
            completionRate: 0,
            mostProductiveTime: null,
            distraction: {
                averageCount: 0,
                mostCommonType: null
            }
        };
    }

    // Total sessions
    const totalSessions = focusSessions.length;
    
    // Average session duration
    const totalDuration = focusSessions.reduce((acc, session) => 
        acc + (session.actualDuration || 0), 0);
    const averageDuration = totalDuration / totalSessions;
    
    // Completion rate
    const completedSessions = focusSessions.filter(session => session.completed).length;
    const completionRate = (completedSessions / totalSessions) * 100;
    
    // Find most productive time
    const timeMap = {};
    focusSessions.forEach(session => {
        if (session.startTime) {
            const hour = new Date(session.startTime).getHours();
            const timeBlock = Math.floor(hour / 4); // Group in 4-hour blocks
            const timeKey = timeBlock === 0 ? 'night' : 
                           timeBlock === 1 ? 'morning' : 
                           timeBlock === 2 ? 'afternoon' : 
                           'evening';
            
            timeMap[timeKey] = timeMap[timeKey] || { 
                count: 0, 
                totalProductivity: 0, 
                sessions: 0
            };
            
            timeMap[timeKey].sessions++;
            if (session.productivity) {
                timeMap[timeKey].totalProductivity += session.productivity;
                timeMap[timeKey].count++;
            }
        }
    });
    
    let mostProductiveTime = null;
    let highestProductivity = -1;
    
    for (const time in timeMap) {
        if (timeMap[time].count > 0) {
            const avgProductivity = timeMap[time].totalProductivity / timeMap[time].count;
            if (avgProductivity > highestProductivity) {
                highestProductivity = avgProductivity;
                mostProductiveTime = time;
            }
        }
    }
    
    // Analyze distractions
    const allDistractions = focusSessions.flatMap(session => session.distractions || []);
    const distractionTypes = {};
    
    allDistractions.forEach(distraction => {
        distractionTypes[distraction.type] = (distractionTypes[distraction.type] || 0) + 1;
    });
    
    let mostCommonType = null;
    let highestCount = 0;
    
    for (const type in distractionTypes) {
        if (distractionTypes[type] > highestCount) {
            highestCount = distractionTypes[type];
            mostCommonType = type;
        }
    }
    
    return {
        totalSessions,
        averageDuration,
        completionRate,
        mostProductiveTime,
        distraction: {
            averageCount: allDistractions.length / totalSessions,
            mostCommonType
        }
    };
};

// Track focus session
exports.trackFocusSession = async (req, res) => {
    try {
        const { userId, sessionData } = req.body;
        
        if (!userId || !sessionData) {
            return res.status(400).json({ error: 'Missing required data' });
        }
        
        // Find or create user behavior record
        let userBehavior = await UserBehavior.findOne({ userId });
        
        if (!userBehavior) {
            userBehavior = new UserBehavior({ 
                userId,
                focusSessions: []
            });
        }
        
        // Add new session
        userBehavior.focusSessions.push(sessionData);
        await userBehavior.save();
        
        res.status(200).json({
            success: true,
            message: 'Focus session tracked successfully'
        });
    } catch (error) {
        console.error('Error tracking focus session:', error);
        res.status(500).json({ error: 'Failed to track focus session' });
    }
};

// Get user analytics
exports.getUserAnalytics = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        const userBehavior = await UserBehavior.findOne({ userId });
        
        if (!userBehavior) {
            return res.status(404).json({ error: 'User behavior data not found' });
        }
        
        // Get focus session analytics
        const focusAnalytics = calculateFocusAnalytics(userBehavior.focusSessions);
        
        // Analyze habits
        const habitsAnalytics = {
            totalHabits: userBehavior.habits.length,
            currentStreaks: userBehavior.habits.map(habit => ({
                name: habit.name,
                streak: habit.streak.current
            })),
            bestStreak: userBehavior.habits.reduce((max, habit) => 
                Math.max(max, habit.streak.best || 0), 0)
        };
        
        res.status(200).json({
            success: true,
            analytics: {
                focus: focusAnalytics,
                habits: habitsAnalytics
            }
        });
    } catch (error) {
        console.error('Error getting user analytics:', error);
        res.status(500).json({ error: 'Failed to get user analytics' });
    }
};

// Update user context data
exports.updateContextData = async (req, res) => {
    try {
        const { userId, contextData } = req.body;
        
        if (!userId || !contextData) {
            return res.status(400).json({ error: 'Missing required data' });
        }
        
        // Find or create user behavior record
        let userBehavior = await UserBehavior.findOne({ userId });
        
        if (!userBehavior) {
            userBehavior = new UserBehavior({ 
                userId,
                contextData: []
            });
        }
        
        // Add context data
        userBehavior.contextData.push(contextData);
        await userBehavior.save();
        
        res.status(200).json({
            success: true,
            message: 'Context data updated successfully'
        });
    } catch (error) {
        console.error('Error updating context data:', error);
        res.status(500).json({ error: 'Failed to update context data' });
    }
}; 