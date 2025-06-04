const UserBehavior = require('../models/UserBehavior');

class PersonalizationEngine {
    /**
     * Generate optimized focus session settings based on user behavior
     * @param {string} userId - The user's ID
     * @returns {Object} - Optimized focus session settings
     */
    async getOptimizedFocusSettings(userId) {
        try {
            const userBehavior = await UserBehavior.findOne({ userId });
            
            if (!userBehavior || !userBehavior.focusSessions || userBehavior.focusSessions.length < 3) {
                return {
                    duration: 25, // Default Pomodoro duration
                    breakDuration: 5,
                    suggestion: "We recommend starting with the standard Pomodoro technique: 25 minutes of focus followed by a 5-minute break."
                };
            }
            
            // Get the last 10 sessions for analysis
            const recentSessions = userBehavior.focusSessions
                .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                .slice(0, 10);
            
            // Calculate average session metrics
            const completedSessions = recentSessions.filter(s => s.completed);
            
            if (completedSessions.length === 0) {
                return {
                    duration: 15, // Shorter duration to build success
                    breakDuration: 5,
                    suggestion: "Try a shorter focus period of 15 minutes to build momentum and success."
                };
            }
            
            // Calculate average duration of completed sessions
            const avgDuration = completedSessions.reduce((sum, s) => 
                sum + (s.actualDuration || s.plannedDuration), 0) / completedSessions.length;
            
            // Calculate average distraction count
            const totalDistractions = recentSessions.reduce((sum, s) => 
                sum + (s.distractions ? s.distractions.length : 0), 0);
            const avgDistractions = totalDistractions / recentSessions.length;
            
            // Rules-based recommendations
            let optimalDuration, breakDuration, suggestion;
            
            if (avgDistractions > 3) {
                // Many distractions - shorter sessions
                optimalDuration = Math.max(15, Math.round(avgDuration * 0.8));
                breakDuration = 5;
                suggestion = `Based on your distraction patterns, shorter ${optimalDuration}-minute focus sessions might help you maintain concentration.`;
            } else if (avgDuration < 20) {
                // User tends to do shorter sessions
                optimalDuration = Math.round(avgDuration * 1.1); // Gradually increase
                breakDuration = 5;
                suggestion = `You're doing well with shorter sessions. We suggest trying ${optimalDuration}-minute sessions to gradually build your focus muscle.`;
            } else if (avgDuration > 40) {
                // User does longer sessions successfully
                optimalDuration = Math.round(avgDuration);
                breakDuration = Math.round(optimalDuration / 5); // 1:5 ratio
                suggestion = `You excel at longer focus periods. We recommend continuing with ${optimalDuration}-minute sessions and ${breakDuration}-minute breaks.`;
            } else {
                // Default case - standard Pomodoro
                optimalDuration = 25;
                breakDuration = 5;
                suggestion = "The classic 25-5 Pomodoro technique seems to be a good fit for your work style.";
            }
            
            return {
                duration: optimalDuration,
                breakDuration: breakDuration,
                suggestion: suggestion
            };
        } catch (error) {
            console.error('Error getting optimized focus settings:', error);
            return {
                duration: 25,
                breakDuration: 5,
                suggestion: "We recommend the standard Pomodoro technique: 25 minutes of focus followed by a 5-minute break."
            };
        }
    }
    
    /**
     * Find the optimal time of day for user focus sessions
     * @param {string} userId - The user's ID
     * @returns {Object} - Optimal time information
     */
    async getOptimalFocusTime(userId) {
        try {
            const userBehavior = await UserBehavior.findOne({ userId });
            
            if (!userBehavior || !userBehavior.focusSessions || userBehavior.focusSessions.length < 5) {
                return {
                    timeBlock: null,
                    suggestion: "We need more data about your focus sessions to recommend optimal times."
                };
            }
            
            const sessions = userBehavior.focusSessions;
            const timeBlocks = {};
            
            // Divide the day into 6 blocks of 4 hours each
            for (let i = 0; i < 6; i++) {
                timeBlocks[i] = {
                    sessions: 0,
                    completed: 0,
                    productivity: 0,
                    productivityCount: 0
                };
            }
            
            // Analyze sessions by time block
            sessions.forEach(session => {
                if (session.startTime) {
                    const hour = new Date(session.startTime).getHours();
                    const block = Math.floor(hour / 4);
                    
                    timeBlocks[block].sessions++;
                    if (session.completed) {
                        timeBlocks[block].completed++;
                    }
                    
                    if (session.productivity) {
                        timeBlocks[block].productivity += session.productivity;
                        timeBlocks[block].productivityCount++;
                    }
                }
            });
            
            // Find the block with highest completion rate and productivity
            let bestBlock = 0;
            let bestScore = -1;
            
            Object.keys(timeBlocks).forEach(block => {
                const blockData = timeBlocks[block];
                if (blockData.sessions > 0) {
                    const completionRate = blockData.completed / blockData.sessions;
                    const avgProductivity = blockData.productivityCount > 0 
                        ? blockData.productivity / blockData.productivityCount 
                        : 0;
                        
                    // Combined score (50% completion rate, 50% productivity)
                    const score = (completionRate * 0.5) + (avgProductivity / 5 * 0.5);
                    
                    if (score > bestScore) {
                        bestScore = score;
                        bestBlock = parseInt(block);
                    }
                }
            });
            
            // Convert block to time range
            const startHour = bestBlock * 4;
            const endHour = startHour + 4;
            const timeRange = `${startHour}:00-${endHour}:00`;
            
            // Generate readable time period
            const timePeriod = startHour === 0 ? "early morning" :
                              startHour === 4 ? "morning" :
                              startHour === 8 ? "late morning" :
                              startHour === 12 ? "afternoon" :
                              startHour === 16 ? "evening" : "night";
            
            return {
                timeBlock: bestBlock,
                timeRange,
                suggestion: `Based on your history, you tend to be most productive during the ${timePeriod} (${timeRange}). Consider scheduling your most important tasks during this time.`
            };
        } catch (error) {
            console.error('Error finding optimal focus time:', error);
            return {
                timeBlock: null,
                suggestion: "We couldn't determine your optimal focus time. Please try again later."
            };
        }
    }
}

module.exports = new PersonalizationEngine(); 