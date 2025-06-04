import React, { useEffect, useState } from 'react';
import personalizationService, { 
    FocusSettings, 
    OptimalTimeRecommendation,
    FocusSession
} from '../services/personalizationService';

interface PersonalizedDashboardProps {
    userId: string;
    userGoals?: string;
}

const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({ userId, userGoals }) => {
    // State for personalized data
    const [insights, setInsights] = useState<string | null>(null);
    const [habitRecommendation, setHabitRecommendation] = useState<string | null>(null);
    const [focusSettings, setFocusSettings] = useState<FocusSettings | null>(null);
    const [optimalTime, setOptimalTime] = useState<OptimalTimeRecommendation | null>(null);
    
    // State for loading/error states
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPersonalizedData = async () => {
            if (!userId) return;
            
            setIsLoading(true);
            setError(null);
            
            try {
                // Fetch all personalized data in parallel
                const [
                    insightsResponse, 
                    habitResponse, 
                    settingsResponse, 
                    timeResponse
                ] = await Promise.all([
                    personalizationService.getPersonalizedInsights(userId),
                    personalizationService.getHabitRecommendations(userId, userGoals),
                    personalizationService.getOptimizedFocusSettings(userId),
                    personalizationService.getOptimalFocusTime(userId)
                ]);
                
                setInsights(insightsResponse);
                setHabitRecommendation(habitResponse);
                setFocusSettings(settingsResponse);
                setOptimalTime(timeResponse);
            } catch (error) {
                console.error('Error fetching personalized data:', error);
                setError('Failed to load personalized recommendations');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchPersonalizedData();
    }, [userId, userGoals]);

    // When a focus session completes, track it
    const trackCompletedFocusSession = async (sessionData: FocusSession) => {
        if (!userId) return;
        await personalizationService.trackFocusSession(userId, sessionData);
    };
    
    // When context changes, update it
    const updateUserContext = async (contextData: any) => {
        if (!userId) return;
        await personalizationService.updateContextData(userId, contextData);
    };

    if (isLoading) {
        return (
            <div className="p-4 bg-white rounded-lg shadow">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-32 bg-slate-200 rounded"></div>
                    <div className="h-6 bg-slate-200 rounded w-2/4"></div>
                    <div className="h-20 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-white rounded-lg shadow">
                <div className="text-red-500">{error}</div>
                <button 
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personalized Insights */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3 text-indigo-700">Your Focus Insights</h3>
                {insights ? (
                    <p className="text-gray-700">{insights}</p>
                ) : (
                    <p className="text-gray-500 italic">
                        Complete a few focus sessions to get personalized insights.
                    </p>
                )}
            </div>
            
            {/* Habit Recommendation */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3 text-green-700">Habit Recommendation</h3>
                {habitRecommendation ? (
                    <p className="text-gray-700">{habitRecommendation}</p>
                ) : (
                    <p className="text-gray-500 italic">
                        Track some habits to get personalized recommendations.
                    </p>
                )}
            </div>
            
            {/* Optimized Focus Settings */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3 text-blue-700">Your Ideal Focus Session</h3>
                {focusSettings ? (
                    <div>
                        <div className="flex justify-between mb-2">
                            <span>Focus Duration:</span>
                            <span className="font-medium">{focusSettings.duration} minutes</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span>Break Duration:</span>
                            <span className="font-medium">{focusSettings.breakDuration} minutes</span>
                        </div>
                        <p className="mt-2 text-gray-700">{focusSettings.suggestion}</p>
                    </div>
                ) : (
                    <p className="text-gray-500 italic">
                        Complete more focus sessions to get optimized settings.
                    </p>
                )}
            </div>
            
            {/* Optimal Time */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3 text-amber-700">Your Optimal Focus Time</h3>
                {optimalTime && optimalTime.timeBlock !== null ? (
                    <div>
                        {optimalTime.timeRange && (
                            <div className="mb-2 font-medium">{optimalTime.timeRange}</div>
                        )}
                        <p className="text-gray-700">{optimalTime.suggestion}</p>
                    </div>
                ) : (
                    <p className="text-gray-500 italic">
                        We need more data to determine your optimal focus time.
                    </p>
                )}
            </div>
        </div>
    );
};

export default PersonalizedDashboard; 