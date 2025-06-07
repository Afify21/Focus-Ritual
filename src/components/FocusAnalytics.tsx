import React, { useState, useEffect } from 'react';
import { FocusAnalyticsService } from '../services/FocusAnalyticsService';
import { Habit } from '../services/HabitReminderService';
import { ChartBarIcon, ClockIcon, ExclamationTriangleIcon, LightBulbIcon } from '@heroicons/react/24/outline';

interface FocusAnalyticsProps {
    habit?: Habit; // Make habit optional
}

const FocusAnalytics: React.FC<FocusAnalyticsProps> = ({ habit }) => {
    const [patterns, setPatterns] = useState<any>(null);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const analyticsService = FocusAnalyticsService.getInstance();
        analyticsService.loadFocusData();

        // If no specific habit is provided, analyze overall focus patterns
        const patterns = habit 
            ? analyticsService.analyzeFocusPatterns(habit.id)
            : analyticsService.analyzeOverallFocusPatterns();
        const recommendations = habit
            ? analyticsService.generateRecommendations(habit.id)
            : analyticsService.generateOverallRecommendations();

        setPatterns(patterns);
        setRecommendations(recommendations);
        setIsLoading(false);
    }, [habit?.id]);

    if (isLoading) {
        return (
            <div className="animate-pulse">
                <div className="h-32 bg-slate-700/50 rounded-lg mb-4"></div>
                <div className="h-24 bg-slate-700/50 rounded-lg"></div>
            </div>
        );
    }

    if (!patterns || patterns.averageFocusDuration === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-slate-400">Start tracking your focus sessions to see personalized insights and recommendations.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Focus Patterns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                        <ClockIcon className="h-5 w-5 text-blue-400 mr-2" />
                        <h3 className="text-lg font-medium text-white">Focus Duration</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{patterns.averageFocusDuration} minutes</p>
                    <p className="text-sm text-slate-400 mt-1">Average session length</p>
                </div>

                <div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                        <ChartBarIcon className="h-5 w-5 text-green-400 mr-2" />
                        <h3 className="text-lg font-medium text-white">Most Productive Time</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-400">{patterns.mostProductiveTime}</p>
                    <p className="text-sm text-slate-400 mt-1">Peak focus hours</p>
                </div>
            </div>

            {/* Focus Drop Points */}
            {patterns.focusDropPoints?.length > 0 && (
                <div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                        <h3 className="text-lg font-medium text-white">Focus Drop Points</h3>
                    </div>
                    <p className="text-slate-300">
                        Your focus tends to drop after {patterns.focusDropPoints[0]} minutes of continuous work.
                    </p>
                </div>
            )}

            {/* Common Distractions */}
            {patterns.commonDistractions?.length > 0 && (
                <div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                        <h3 className="text-lg font-medium text-white">Common Distractions</h3>
                    </div>
                    <ul className="list-disc list-inside text-slate-300">
                        {patterns.commonDistractions.map((distraction: string, index: number) => (
                            <li key={index}>{distraction}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Personalized Recommendations */}
            {recommendations?.length > 0 && (
                <div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="flex items-center mb-4">
                        <LightBulbIcon className="h-5 w-5 text-yellow-400 mr-2" />
                        <h3 className="text-lg font-medium text-white">Personalized Recommendations</h3>
                    </div>
                    <div className="space-y-3">
                        {recommendations.map((rec, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg ${rec.priority === 'high'
                                        ? 'bg-red-500/20 border border-red-500/30'
                                        : rec.priority === 'medium'
                                            ? 'bg-yellow-500/20 border border-yellow-500/30'
                                            : 'bg-blue-500/20 border border-blue-500/30'
                                    }`}
                            >
                                <p className="text-slate-300">{rec.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FocusAnalytics; 