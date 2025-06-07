import React, { useEffect, useRef, useState } from 'react';
import './NewAnalyticsPage.css';
import Analytics from '../components/Analytics';
import DataService, { Habit, FocusSession, Achievement } from '../services/DataService';
import { format } from 'date-fns';
import { PlusIcon } from '@heroicons/react/24/solid';
import GoalsSection from '../components/GoalsSection';
import { useNavigate } from 'react-router-dom';

const NewAnalyticsPage: React.FC = () => {
    const particlesRef = useRef<HTMLDivElement>(null);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [sessions, setSessions] = useState<FocusSession[]>([]);
    const [aiInsights, setAiInsights] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [newGoal, setNewGoal] = useState('');
    const [goals, setGoals] = useState<string[]>(() => {
        const savedGoals = localStorage.getItem('focus-ritual-goals');
        return savedGoals ? JSON.parse(savedGoals) : [];
    });
    const navigate = useNavigate();

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
        <div className="app-container">
            <div className="particles" ref={particlesRef}></div>

            <main className="main-content">
                {/* Habits Section */}
                <section className="section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <i className="fas fa-tasks"></i>
                            Today's Habits
                        </h2>
                        <button
                            onClick={() => navigate('/habits')}
                            className="text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            View All
                        </button>
                    </div>
                    <div className="space-y-2">
                        {habits.slice(0, 3).map((habit) => (
                            <div
                                key={habit.id}
                                className="habit-item flex items-center justify-between p-3 rounded-lg"
                            >
                                <div className="flex items-center flex-1">
                                    <button
                                        onClick={() => toggleHabitCompletion(habit.id)}
                                        className={`h-5 w-5 rounded mr-3 flex items-center justify-center border ${habit.completionHistory.includes(format(new Date(), 'yyyy-MM-dd'))
                                            ? 'border-green-500 bg-green-500/20'
                                            : 'border-slate-400'
                                            }`}
                                    >
                                        {habit.completionHistory.includes(format(new Date(), 'yyyy-MM-dd')) && (
                                            <i className="fas fa-check text-green-500 text-xs"></i>
                                        )}
                                    </button>
                                    <div>
                                        <div className="text-white text-sm">{habit.name}</div>
                                        {habit.streak > 0 && (
                                            <div className="text-xs text-slate-400">
                                                {habit.streak} day streak
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {habits.length > 3 && (
                            <div className="text-center text-sm text-slate-400">
                                +{habits.length - 3} more habits
                            </div>
                        )}
                    </div>
                </section>

                {/* Goals Section */}
                <GoalsSection />

                {/* Challenges Section */}
                <section className="section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <i className="fas fa-trophy"></i>
                            Active Challenges
                        </h2>
                        <button
                            onClick={() => navigate('/challenges')}
                            className="text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            View All
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default NewAnalyticsPage; 