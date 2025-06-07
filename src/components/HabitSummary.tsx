import React, { useState, useEffect } from 'react';
import { CheckIcon, ArrowRightIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import HabitCalendarView from './HabitCalendarView';

interface Habit {
    id: string;
    name: string;
    description?: string;
    frequency: {
        type: 'daily' | 'weekly' | 'custom';
        days?: number[]; // [0,1,2,3,4,5,6] for specific days of week
    };
    completionHistory: {
        [date: string]: boolean;
    };
    streak: number;
    color?: string;
    createdAt: string;
    goalCompleted: boolean;
    goalCompletedAt: string;
    goalDuration: number;
}

const HabitSummary: React.FC = () => {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newGoal, setNewGoal] = useState('');
    const [goals, setGoals] = useState<string[]>(() => {
        const savedGoals = localStorage.getItem('focus-ritual-goals');
        return savedGoals ? JSON.parse(savedGoals) : [];
    });
    const navigate = useNavigate();

    // Format date to YYYY-MM-DD
    const formatDate = (date: Date = new Date()): string => {
        return date.toISOString().split('T')[0];
    };

    useEffect(() => {
        // Load habits from localStorage
        const savedHabits = localStorage.getItem('focus-ritual-habits');
        const parsedHabits = savedHabits ? JSON.parse(savedHabits) : [];
        setHabits(parsedHabits);
        setIsLoading(false);
    }, []);

    // Toggle habit completion
    const toggleHabitCompletion = (habitId: string) => {
        const today = formatDate();
        const updatedHabits = habits.map(habit => {
            if (habit.id === habitId) {
                const wasCompleted = habit.completionHistory[today];
                const newCompletionHistory = {
                    ...habit.completionHistory,
                    [today]: !wasCompleted
                };

                // Calculate streak properly
                let streak = 0;
                const currentDate = new Date();
                let consecutiveDays = true;

                for (let i = 0; consecutiveDays && i < 100; i++) {
                    const checkDate = new Date();
                    checkDate.setDate(currentDate.getDate() - i);
                    const dateStr = formatDate(checkDate);

                    const isCompleted = i === 0 ? newCompletionHistory[dateStr] : habit.completionHistory[dateStr];

                    if (isCompleted) {
                        streak++;
                    } else {
                        consecutiveDays = false;
                    }
                }

                // Check if goal is completed
                const goalCompleted = !habit.goalCompleted && streak >= habit.goalDuration;
                const goalCompletedAt = goalCompleted ? new Date().toISOString() : habit.goalCompletedAt;

                return {
                    ...habit,
                    completionHistory: newCompletionHistory,
                    streak: streak,
                    goalCompleted: goalCompleted || habit.goalCompleted,
                    goalCompletedAt
                };
            }
            return habit;
        });

        setHabits(updatedHabits);
        localStorage.setItem('focus-ritual-habits', JSON.stringify(updatedHabits));
    };

    // Get only habits due today
    const todayHabits = habits.filter(habit => {
        // For simplicity, we're just showing all habits marked as 'daily'
        // In a full implementation, we'd check weekly/custom habits too
        return habit.frequency.type === 'daily';
    }).slice(0, 3); // Only show top 3 habits in summary

    const today = formatDate();
    const todayCompletionCount = habits.filter(habit => habit.completionHistory[today]).length;
    const completionRate = habits.length > 0 ? Math.round((todayCompletionCount / habits.length) * 100) : 0;

    const handleAddGoal = () => {
        if (newGoal.trim()) {
            const updatedGoals = [...goals, newGoal.trim()];
            setGoals(updatedGoals);
            localStorage.setItem('focus-ritual-goals', JSON.stringify(updatedGoals));
            setNewGoal('');
        }
    };

    const handleRemoveGoal = (index: number) => {
        const updatedGoals = goals.filter((_, i) => i !== index);
        setGoals(updatedGoals);
        localStorage.setItem('focus-ritual-goals', JSON.stringify(updatedGoals));
    };

    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Habit Tracker</h2>
                <button
                    onClick={() => navigate('/habits')}
                    className="flex items-center text-sm text-slate-300 hover:text-white"
                >
                    <span>View All</span>
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                </button>
            </div>

            {isLoading ? (
                <div className="text-center text-slate-400">Loading habits...</div>
            ) : habits.length === 0 ? (
                <div className="text-center text-slate-400">
                    No habits yet. Create your first habit to get started!
                </div>
            ) : (
                <>
                    <HabitCalendarView
                        habits={habits}
                        onToggleDate={toggleHabitCompletion}
                    />

                    <div className="mt-4 space-y-2">
                        {todayHabits.map(habit => {
                            const isCompletedToday = habit.completionHistory[today];

                            return (
                                <div
                                    key={habit.id}
                                    className="flex items-center justify-between p-2 rounded-lg bg-slate-700/50"
                                >
                                    <div className="flex items-center flex-1">
                                        <button
                                            onClick={() => toggleHabitCompletion(habit.id)}
                                            className={`h-5 w-5 rounded mr-3 flex items-center justify-center ${isCompletedToday ? 'bg-green-600' : 'border border-slate-400'
                                                }`}
                                        >
                                            {isCompletedToday && <CheckIcon className="h-3 w-3 text-white" />}
                                        </button>
                                        <div>
                                            <div className="text-white text-sm">{habit.name}</div>
                                            {habit.streak > 0 && (
                                                <div className="text-xs text-yellow-300">
                                                    {habit.streak} day{habit.streak !== 1 ? 's' : ''}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {habits.length > 3 && (
                            <div className="text-center mt-2 text-sm text-slate-400">
                                <span>+{habits.length - 3} more habits</span>
                            </div>
                        )}
                    </div>

                    {/* Goals Section */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-white mb-3">Today's Goals</h3>
                        <div className="space-y-2">
                            {goals.map((goal, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-2 rounded-lg bg-slate-700/50"
                                >
                                    <div className="flex items-center flex-1">
                                        <button
                                            onClick={() => handleRemoveGoal(index)}
                                            className="h-5 w-5 rounded mr-3 flex items-center justify-center border border-slate-400 hover:bg-red-500/20 hover:border-red-500 transition-colors"
                                        >
                                            <span className="text-slate-400 hover:text-red-400">×</span>
                                        </button>
                                        <div className="text-white text-sm">{goal}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-3 flex gap-2">
                            <input
                                type="text"
                                value={newGoal}
                                onChange={(e) => setNewGoal(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                                placeholder="Add a new goal..."
                                className="flex-1 px-3 py-2 bg-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                            />
                            <button
                                onClick={handleAddGoal}
                                className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-1"
                            >
                                <PlusIcon className="h-4 w-4" />
                                <span>Add</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default HabitSummary; 