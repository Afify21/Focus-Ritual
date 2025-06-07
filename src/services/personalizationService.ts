import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

export interface FocusSession {
    startTime: Date;
    endTime: Date;
    plannedDuration: number;
    actualDuration: number;
    completed: boolean;
    distractions?: {
        time: Date;
        type: string;
        description: string;
    }[];
    mood?: {
        before: number | null;
        after: number | null;
    };
    productivity?: number;
    tags?: string[];
    notes?: string;
}

export interface ContextData {
    timeOfDay?: string;
    deviceType?: string;
    location?: string;
    activityBefore?: string;
    activityAfter?: string;
}

export interface FocusSettings {
    duration: number;
    breakDuration: number;
    suggestion: string;
}

export interface OptimalTimeRecommendation {
    timeBlock: number | null;
    timeRange?: string;
    suggestion: string;
}

class PersonalizationService {
    /**
     * Track a focus session for a user
     */
    async trackFocusSession(userId: string, sessionData: FocusSession): Promise<boolean> {
        try {
            const response = await axios.post(`${API_URL}/personalization/track-session`, {
                userId,
                sessionData
            });
            return response.data.success;
        } catch (error) {
            console.error('Error tracking focus session:', error);
            return false;
        }
    }

    /**
     * Update user context data
     */
    async updateContextData(userId: string, contextData: ContextData): Promise<boolean> {
        try {
            const response = await axios.post(`${API_URL}/personalization/context`, {
                userId,
                contextData
            });
            return response.data.success;
        } catch (error) {
            console.error('Error updating context data:', error);
            return false;
        }
    }

    /**
     * Get user analytics
     */
    async getUserAnalytics(userId: string) {
        try {
            const response = await axios.get(`${API_URL}/personalization/analytics/${userId}`);
            return response.data.analytics;
        } catch (error) {
            console.error('Error fetching user analytics:', error);
            return null;
        }
    }

    /**
     * Get optimized focus settings for a user
     */
    async getOptimizedFocusSettings(userId: string): Promise<FocusSettings | null> {
        try {
            const response = await axios.get(`${API_URL}/personalization/focus-settings/${userId}`);
            return response.data.settings;
        } catch (error) {
            console.error('Error fetching optimized focus settings:', error);
            return null;
        }
    }

    /**
     * Get optimal time recommendation for focus
     */
    async getOptimalFocusTime(userId: string): Promise<OptimalTimeRecommendation | null> {
        try {
            const response = await axios.get(`${API_URL}/personalization/optimal-time/${userId}`);
            return response.data.recommendation;
        } catch (error) {
            console.error('Error fetching optimal focus time:', error);
            return null;
        }
    }

    /**
     * Get personalized insights for a user
     */
    async getPersonalizedInsights(userId: string): Promise<string | null> {
        try {
            const response = await axios.get(`${API_URL}/personalization/insights/${userId}`);
            return response.data.insights;
        } catch (error) {
            console.error('Error fetching personalized insights:', error);
            return null;
        }
    }

    /**
     * Get personalized habit recommendations
     */
    async getHabitRecommendations(userId: string, goals?: string): Promise<string | null> {
        try {
            const response = await axios.post(`${API_URL}/personalization/habit-recommendations`, {
                userId,
                goals
            });
            return response.data.recommendation;
        } catch (error) {
            console.error('Error fetching habit recommendations:', error);
            return null;
        }
    }
}

export default new PersonalizationService(); 