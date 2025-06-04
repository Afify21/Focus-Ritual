/**
 * Personalized Insights Service
 * 
 * This service uses the existing Gemini API to generate personalized insights
 * while staying within free tier limits. It leverages collected user data
 * to make the AI responses more personalized.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

class PersonalizedInsightsService {
    /**
     * Generate personalized focus insights based on user behavior
     * @param {Object} userData - User behavior data 
     * @returns {Object} - Personalized insights
     */
    async generateFocusInsights(userData) {
        try {
            if (!process.env.GEMINI_API_KEY) {
                console.error('GEMINI_API_KEY is not set');
                return {
                    success: false,
                    error: 'AI service not configured'
                };
            }

            if (!userData) {
                return {
                    success: false,
                    error: 'No user data provided'
                };
            }

            // Extract relevant data for the prompt
            const {
                focusSessions = [],
                habits = [],
                contextData = []
            } = userData;

            // Calculate basic metrics for the prompt
            const totalSessions = focusSessions.length;
            const completedSessions = focusSessions.filter(s => s.completed).length;
            const completionRate = totalSessions > 0 
                ? Math.round((completedSessions / totalSessions) * 100) 
                : 0;
                
            const avgSessionDuration = totalSessions > 0
                ? Math.round(focusSessions.reduce((sum, s) => 
                    sum + (s.actualDuration || 0), 0) / totalSessions)
                : 0;
                
            // Extract common distractions
            const distractionTypes = {};
            focusSessions.forEach(session => {
                (session.distractions || []).forEach(d => {
                    distractionTypes[d.type] = (distractionTypes[d.type] || 0) + 1;
                });
            });
            
            const sortedDistractions = Object.entries(distractionTypes)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([type]) => type);

            // Extract mood patterns
            const moodChanges = focusSessions
                .filter(s => s.mood && s.mood.before != null && s.mood.after != null)
                .map(s => ({
                    change: s.mood.after - s.mood.before,
                    duration: s.actualDuration || 0,
                    completed: s.completed
                }));
            
            // Create a prompt that leverages the user data
            const prompt = `
You are a personalized focus coach for a specific user. Your goal is to provide tailored insights 
and suggestions that feel highly personalized. Use the following data about the user to generate 
your response.

User focus stats:
- Total focus sessions: ${totalSessions}
- Completion rate: ${completionRate}%
- Average session duration: ${avgSessionDuration} minutes
${sortedDistractions.length > 0 ? `- Common distractions: ${sortedDistractions.join(', ')}` : ''}

${habits.length > 0 ? `Current habits: ${habits.map(h => h.name).join(', ')}` : 'No habits tracked yet'}

Based ONLY on this information, provide:
1. A personalized insight about their focus patterns
2. ONE specific, actionable suggestion to improve focus
3. A brief motivational note that acknowledges their current level

Keep your response under 150 words, direct, and conversational. Make it feel like it was written 
specifically for this user based on their unique data. Don't use generic advice that could apply to anyone.
Don't mention that you're analyzing data or that this is AI-generated.
`;

            // Generate the insights using Gemini
            const result = await model.generateContent(prompt);
            const response = result.response;
            const insights = response.text();

            return {
                success: true,
                insights
            };

        } catch (error) {
            console.error('Error generating personalized insights:', error);
            return {
                success: false,
                error: 'Failed to generate insights',
                details: error.message
            };
        }
    }

    /**
     * Generate habit recommendations based on user behavior
     * @param {Object} userData - User behavior data
     * @returns {Object} - Habit recommendations
     */
    async generateHabitRecommendations(userData) {
        try {
            if (!process.env.GEMINI_API_KEY) {
                console.error('GEMINI_API_KEY is not set');
                return {
                    success: false,
                    error: 'AI service not configured'
                };
            }

            // Extract habits and focus sessions
            const {
                habits = [],
                focusSessions = [],
                goals = 'improve focus and productivity'
            } = userData;

            // Analyze focus session patterns
            const avgDuration = focusSessions.length > 0
                ? Math.round(focusSessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0) / focusSessions.length)
                : 0;
            
            const completionRate = focusSessions.length > 0
                ? Math.round((focusSessions.filter(s => s.completed).length / focusSessions.length) * 100)
                : 0;

            // Create a prompt for habit recommendations
            const prompt = `
You are a habit formation specialist for a focus app. Your goal is to recommend personalized habits
to help this specific user improve their focus and productivity.

User data:
- Current habits: ${habits.length > 0 ? habits.map(h => h.name).join(', ') : 'None tracked yet'}
- Average focus session: ${avgDuration} minutes
- Focus completion rate: ${completionRate}%
- User's goals: ${goals}

Based ONLY on this information:
1. Recommend ONE new specific habit that would help this user improve their focus
2. Explain why this habit would specifically benefit THEM based on their data
3. Suggest how to implement this habit (when and how to do it)

Keep your response under 120 words, direct, and personalized. Make it feel like it was written
specifically for this user based on their unique situation.
`;

            // Generate the recommendations
            const result = await model.generateContent(prompt);
            const response = result.response;
            const recommendation = response.text();

            return {
                success: true,
                recommendation
            };

        } catch (error) {
            console.error('Error generating habit recommendations:', error);
            return {
                success: false,
                error: 'Failed to generate habit recommendations',
                details: error.message
            };
        }
    }
}

module.exports = new PersonalizedInsightsService(); 