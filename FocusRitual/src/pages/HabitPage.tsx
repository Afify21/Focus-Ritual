import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import HabitTracker from '../components/HabitTracker';
import { useNavigate } from 'react-router-dom';

interface Habit {
    id: string;
    name: string;
    description?: string;
    category: string;
    frequency: {
        type: 'daily' | 'weekly' | 'custom';
        days?: number[];
    };
    completionHistory: {
        [date: string]: boolean;
    };
    streak: number;
    createdAt: string;
}

const HabitPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'habits' | 'stats' | 'insights'>('habits');
    const [habits, setHabits] = useState<Habit[]>([]);
    const [statsPeriod, setStatsPeriod] = useState<'week' | 'month'>('week');
    const [insights, setInsights] = useState<{
        loading: boolean;
        data: {
            streak_analysis: string;
            pattern_analysis: string;
            recommendations: string[];
        } | null;
    }>({
        loading: false,
        data: null
    });

    // Load habits when component mounts
    useEffect(() => {
        const loadHabits = () => {
            const storedHabits = localStorage.getItem('focus-ritual-habits');
            if (storedHabits) {
                setHabits(JSON.parse(storedHabits));
            }
        };

        // Load habits initially
        loadHabits();

        // Listen for storage events (when localStorage changes)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'focus-ritual-habits') {
                loadHabits();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Set interval to check for changes (backup for same-window changes)
        const interval = setInterval(loadHabits, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    // Format date to YYYY-MM-DD
    const formatDate = (date: Date = new Date()): string => {
        return date.toISOString().split('T')[0];
    };

    // Get dates for the last N days
    const getLastNDays = (days: number) => {
        const dates = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(formatDate(date));
        }
        return dates;
    };

    // Calculate completion rate for the specified period
    const calculateCompletionRate = (): number => {
        if (habits.length === 0) return 0;

        const dates = statsPeriod === 'week' ? getLastNDays(7) : getLastNDays(30);
        let totalPossible = habits.length * dates.length;
        let completed = 0;

        dates.forEach(date => {
            habits.forEach(habit => {
                if (habit.completionHistory[date]) {
                    completed++;
                }
            });
        });

        return Math.round((completed / totalPossible) * 100);
    };

    // Find longest streak across all habits
    const calculateLongestStreak = (): number => {
        if (habits.length === 0) return 0;
        return Math.max(...habits.map(habit => habit.streak));
    };

    // Calculate average streak for all habits
    const calculateAverageStreak = (): number => {
        if (habits.length === 0) return 0;
        const total = habits.reduce((sum, habit) => sum + habit.streak, 0);
        return Math.round(total / habits.length);
    };

    // Get AI insights for habits
    const getAIInsights = async () => {
        setInsights({ loading: true, data: null });

        try {
            // Try actual API call first
            try {
                const response = await fetch('/api/habits/insights', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ habits }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setInsights({
                        loading: false,
                        data: data
                    });
                    return;
                }
                throw new Error('API request failed');
            } catch (apiError) {
                console.log('API error, using mock insights', apiError);

                // Simulate delay for mock data
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Generate mock insights based on actual habit data
                const mockInsights = {
                    streak_analysis: generateMockStreakAnalysis(habits),
                    pattern_analysis: generateMockPatternAnalysis(habits),
                    recommendations: generateMockRecommendations(habits)
                };

                setInsights({
                    loading: false,
                    data: mockInsights
                });
            }
        } catch (error) {
            console.error('Error getting AI insights:', error);
            setInsights({
                loading: false,
                data: {
                    streak_analysis: "Unable to analyze habits at this time.",
                    pattern_analysis: "Error generating insights.",
                    recommendations: ["Try again later."]
                }
            });
        }
    };

    // Mock data generation based on actual habits
    const generateMockStreakAnalysis = (habits: Habit[]): string => {
        if (habits.length === 0) {
            return "You haven't created any habits yet. Start by adding your first habit!";
        }

        const maxStreak = Math.max(...habits.map(h => h.streak));
        const avgStreak = habits.reduce((sum, h) => sum + h.streak, 0) / habits.length;

        if (maxStreak > 5) {
            return `You're doing great! Your longest streak is ${maxStreak} days with "${habits.find(h => h.streak === maxStreak)?.name}". Keep going to build this into a lasting habit.`;
        } else if (maxStreak > 0) {
            return `You're making progress with your habits. Your current average streak is ${avgStreak.toFixed(1)} days. Try to maintain consistency for at least 21 days to form stronger habits.`;
        } else {
            return "You're just getting started! Remember that consistency is key to forming habits. Focus on completing your habits daily, even with minimal effort, to build momentum.";
        }
    };

    const generateMockPatternAnalysis = (habits: Habit[]): string => {
        if (habits.length === 0) return "";

        // Get completion counts by day of week and time of day
        const dayCompletions = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
        const timeCompletions = Array(24).fill(0); // Hour of day
        let totalCompletions = 0;
        let morningCompletions = 0;
        let afternoonCompletions = 0;
        let eveningCompletions = 0;

        habits.forEach(habit => {
            Object.entries(habit.completionHistory).forEach(([dateStr, completed]) => {
                if (completed) {
                    const date = new Date(dateStr);
                    const day = date.getDay();
                    const hour = date.getHours();
                    dayCompletions[day]++;
                    timeCompletions[hour]++;
                    totalCompletions++;

                    // Categorize by time of day
                    if (hour >= 5 && hour < 12) morningCompletions++;
                    else if (hour >= 12 && hour < 17) afternoonCompletions++;
                    else eveningCompletions++;
                }
            });
        });

        if (totalCompletions === 0) {
            return "No habit completion data available yet. Start tracking your habits to see patterns emerge.";
        }

        // Find most and least active days
        const maxDay = dayCompletions.indexOf(Math.max(...dayCompletions));
        const minDay = dayCompletions.indexOf(Math.min(...dayCompletions));
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        // Find most productive time of day
        const timeOfDay = morningCompletions > afternoonCompletions && morningCompletions > eveningCompletions
            ? "morning"
            : afternoonCompletions > eveningCompletions
                ? "afternoon"
                : "evening";

        // Find most productive hour
        const mostProductiveHour = timeCompletions.indexOf(Math.max(...timeCompletions));
        const hourDescription = mostProductiveHour < 12
            ? `${mostProductiveHour} AM`
            : `${mostProductiveHour - 12} PM`;

        // Generate personalized insights
        const insights = [];

        // Time of day insight
        insights.push(`You're most productive during the ${timeOfDay}. Consider scheduling your most challenging tasks during this time.`);

        // Peak hour insight
        insights.push(`Your peak productivity hour is around ${hourDescription}. This might be the best time for deep work or important tasks.`);

        // Day of week insights
        if (maxDay !== minDay) {
            const productivityGap = dayCompletions[maxDay] - dayCompletions[minDay];
            if (productivityGap > 2) {
                insights.push(`You're significantly more productive on ${days[maxDay]}s compared to ${days[minDay]}s. Consider adjusting your schedule to take advantage of this pattern.`);
            }
        }

        // Focus duration insights
        const consecutiveCompletions = habits.reduce((max, habit) => {
            let current = 0;
            let maxConsecutive = 0;
            Object.values(habit.completionHistory).forEach(completed => {
                if (completed) {
                    current++;
                    maxConsecutive = Math.max(maxConsecutive, current);
                } else {
                    current = 0;
                }
            });
            return Math.max(max, maxConsecutive);
        }, 0);

        if (consecutiveCompletions > 0) {
            if (consecutiveCompletions <= 2) {
                insights.push("You tend to work in shorter bursts. The Pomodoro technique (25-minute work sessions) might be more effective for you than longer sessions.");
            } else if (consecutiveCompletions <= 4) {
                insights.push("You work well in moderate-length sessions. Consider using 45-minute work blocks with 15-minute breaks.");
            } else {
                insights.push("You can maintain focus for extended periods. You might benefit from longer 90-minute deep work sessions.");
            }
        }

        // Break pattern insights
        const breakPatterns = habits.reduce<number[]>((patterns, habit) => {
            let lastCompletion: string | null = null;
            Object.entries(habit.completionHistory).forEach(([dateStr, completed]) => {
                if (completed) {
                    if (lastCompletion) {
                        const hours = (new Date(dateStr).getTime() - new Date(lastCompletion).getTime()) / (1000 * 60 * 60);
                        if (hours > 1) patterns.push(hours);
                    }
                    lastCompletion = dateStr;
                }
            });
            return patterns;
        }, []);

        if (breakPatterns.length > 0) {
            const avgBreakDuration = breakPatterns.reduce((sum, hours) => sum + hours, 0) / breakPatterns.length;
            if (avgBreakDuration > 4) {
                insights.push("You tend to take longer breaks between work sessions. Consider implementing more structured, shorter breaks to maintain momentum.");
            } else if (avgBreakDuration < 1) {
                insights.push("You take very short breaks between sessions. Remember to take longer breaks occasionally to prevent burnout.");
            }
        }

        return insights.join(" ");
    };

    const generateMockRecommendations = (habits: Habit[]): string[] => {
        if (habits.length === 0) {
            return [
                "Start with a simple daily habit like drinking water or a short meditation",
                "Track one habit consistently before adding more",
                "Set reminders to help you remember your new habits"
            ];
        }

        const recommendations = [];

        // Check category distribution
        const categories = habits.map(h => h.category);
        const uniqueCategories = new Set(categories);

        if (uniqueCategories.size <= 2 && habits.length > 3) {
            recommendations.push("Consider diversifying your habits across more life categories for better balance.");
        }

        // Check for streaks
        const hasLowStreaks = habits.some(h => h.streak < 3);
        if (hasLowStreaks) {
            recommendations.push("Some of your habits have low streaks. Try focusing on consistent completion before adding new habits.");
        }

        // Check for habit tracking consistency
        const completionsCount = habits.reduce((sum, habit) => {
            return sum + Object.values(habit.completionHistory).filter(val => val).length;
        }, 0);

        if (completionsCount < habits.length * 3) {
            recommendations.push("Your habit tracking is inconsistent. Consider setting a daily reminder to track your habits.");
        }

        // Add generic recommendations if needed
        if (recommendations.length < 3) {
            const genericRecommendations = [
                "Stack new habits onto existing routines to increase success rate",
                "Start with 'mini habits' that take less than 2 minutes to complete",
                "Track your progress visually to stay motivated",
                "Share your habit goals with someone to increase accountability",
                "Celebrate small wins to build positive momentum"
            ];

            while (recommendations.length < 3) {
                const rnd = Math.floor(Math.random() * genericRecommendations.length);
                recommendations.push(genericRecommendations[rnd]);
                genericRecommendations.splice(rnd, 1);
            }
        }

        return recommendations;
    };

    return (
        <div className="fixed inset-0 bg-slate-900 overflow-y-auto">
            <div className="min-h-screen text-white p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header with back button */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/')}
                                className="mr-4 p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                            </button>
                            <h1 className="text-3xl font-bold">Habit Tracker</h1>
                        </div>
                    </div>

                    {/* Tabs navigation */}
                    <div className="mb-8 border-b border-slate-700">
                        <div className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('habits')}
                                className={`pb-4 px-2 font-medium text-lg transition-colors ${activeTab === 'habits'
                                    ? 'text-white border-b-2 border-blue-500'
                                    : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                My Habits
                            </button>
                            <button
                                onClick={() => setActiveTab('stats')}
                                className={`pb-4 px-2 font-medium text-lg transition-colors ${activeTab === 'stats'
                                    ? 'text-white border-b-2 border-blue-500'
                                    : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                Statistics
                            </button>
                            <button
                                onClick={() => setActiveTab('insights')}
                                className={`pb-4 px-2 font-medium text-lg transition-colors ${activeTab === 'insights'
                                    ? 'text-white border-b-2 border-blue-500'
                                    : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                AI Insights
                            </button>
                        </div>
                    </div>

                    {/* Content area */}
                    <div className="mt-6">
                        {activeTab === 'habits' && (
                            <div className="bg-slate-800 p-8 rounded-xl shadow-xl">
                                <HabitTracker />
                            </div>
                        )}

                        {activeTab === 'stats' && (
                            <div className="bg-slate-800 p-8 rounded-xl shadow-xl">
                                {habits.length === 0 ? (
                                    <div className="text-center py-12">
                                        <h3 className="text-2xl font-medium text-slate-300 mb-4">No Statistics Available</h3>
                                        <p className="text-slate-400">
                                            Add some habits and start tracking them to see statistics.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Period selector */}
                                        <div className="flex justify-end mb-6">
                                            <div className="inline-flex rounded-md bg-slate-700/70">
                                                <button
                                                    onClick={() => setStatsPeriod('week')}
                                                    className={`px-4 py-2 text-sm rounded-l-md transition ${statsPeriod === 'week'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-slate-300 hover:bg-slate-600'
                                                        }`}
                                                >
                                                    Last 7 Days
                                                </button>
                                                <button
                                                    onClick={() => setStatsPeriod('month')}
                                                    className={`px-4 py-2 text-sm rounded-r-md transition ${statsPeriod === 'month'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-slate-300 hover:bg-slate-600'
                                                        }`}
                                                >
                                                    Last 30 Days
                                                </button>
                                            </div>
                                        </div>

                                        {/* Summary metrics */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                            <div className="bg-slate-700/50 p-6 rounded-lg">
                                                <h4 className="text-lg font-medium mb-2">Average Streak</h4>
                                                <div className="text-5xl font-bold text-blue-400">{calculateAverageStreak()}</div>
                                            </div>
                                            <div className="bg-slate-700/50 p-6 rounded-lg">
                                                <h4 className="text-lg font-medium mb-2">Completion Rate</h4>
                                                <div className="text-5xl font-bold text-green-400">{calculateCompletionRate()}%</div>
                                            </div>
                                            <div className="bg-slate-700/50 p-6 rounded-lg">
                                                <h4 className="text-lg font-medium mb-2">Longest Streak</h4>
                                                <div className="text-5xl font-bold text-yellow-400">{calculateLongestStreak()}</div>
                                            </div>
                                        </div>

                                        {/* Charts */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                                            {/* Completion over time */}
                                            <div className="bg-slate-700/30 p-6 rounded-lg">
                                                <h4 className="text-lg font-medium mb-4">Completion Rate Over Time</h4>
                                                <div className="h-80 flex items-center justify-center">
                                                    <p className="text-slate-400">Chart visualization temporarily unavailable</p>
                                                </div>
                                            </div>

                                            {/* Category breakdown */}
                                            <div className="bg-slate-700/30 p-6 rounded-lg">
                                                <h4 className="text-lg font-medium mb-4">Habits by Category</h4>
                                                <div className="h-80 flex items-center justify-center">
                                                    <p className="text-slate-400">Chart visualization temporarily unavailable</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Most consistent and least consistent habits */}
                                        <div className="mt-8">
                                            <h4 className="text-lg font-medium mb-4">Habit Performance</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-slate-700/30 p-4 rounded-lg">
                                                    <h5 className="text-md font-medium mb-2 text-green-400">Most Consistent</h5>
                                                    {habits.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {[...habits]
                                                                .sort((a, b) => b.streak - a.streak)
                                                                .slice(0, 3)
                                                                .map(habit => (
                                                                    <div key={habit.id} className="flex justify-between items-center p-2 bg-slate-600/50 rounded">
                                                                        <span>{habit.name}</span>
                                                                        <span className="text-yellow-300">{habit.streak} days</span>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    ) : (
                                                        <p className="text-slate-400 text-sm">No data available</p>
                                                    )}
                                                </div>
                                                <div className="bg-slate-700/30 p-4 rounded-lg">
                                                    <h5 className="text-md font-medium mb-2 text-red-400">Needs Attention</h5>
                                                    {habits.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {[...habits]
                                                                .sort((a, b) => a.streak - b.streak)
                                                                .slice(0, 3)
                                                                .map(habit => (
                                                                    <div key={habit.id} className="flex justify-between items-center p-2 bg-slate-600/50 rounded">
                                                                        <span>{habit.name}</span>
                                                                        <span className="text-slate-300">{habit.streak} days</span>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    ) : (
                                                        <p className="text-slate-400 text-sm">No data available</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'insights' && (
                            <div className="bg-slate-800 p-8 rounded-xl shadow-xl">
                                {habits.length === 0 ? (
                                    <div className="text-center py-12">
                                        <h3 className="text-2xl font-medium text-slate-300 mb-4">No Data for Insights</h3>
                                        <p className="text-slate-400">
                                            Add some habits and start tracking them to receive AI-powered insights and recommendations.
                                        </p>
                                    </div>
                                ) : insights.data ? (
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-xl font-bold mb-6">AI Habit Insights</h3>
                                            <button
                                                onClick={getAIInsights}
                                                className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                                            >
                                                Refresh Analysis
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="bg-slate-700/50 rounded-lg p-6">
                                                <h4 className="text-lg font-medium mb-4 text-green-400">Streak Analysis</h4>
                                                <p className="text-slate-300">{insights.data.streak_analysis}</p>
                                            </div>

                                            <div className="bg-slate-700/50 rounded-lg p-6">
                                                <h4 className="text-lg font-medium mb-4 text-blue-400">Pattern Recognition</h4>
                                                <p className="text-slate-300">{insights.data.pattern_analysis}</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 bg-slate-700/50 rounded-lg p-6">
                                            <h4 className="text-lg font-medium mb-4 text-yellow-400">Personalized Recommendations</h4>
                                            <ul className="list-disc pl-5 space-y-3">
                                                {insights.data.recommendations.map((rec, i) => (
                                                    <li key={i} className="text-slate-300">{rec}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        {insights.loading ? (
                                            <div className="text-center">
                                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                                                <p className="text-slate-300">Analyzing your habit data...</p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <p className="text-slate-300 mb-4">
                                                    Get personalized insights about your habits and recommendations to improve.
                                                </p>
                                                <button
                                                    onClick={getAIInsights}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
                                                >
                                                    Generate Insights
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HabitPage;
