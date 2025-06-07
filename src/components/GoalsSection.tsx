import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';

const GoalsSection: React.FC = () => {
    const [newGoal, setNewGoal] = useState('');
    const [goals, setGoals] = useState<string[]>(() => {
        const savedGoals = localStorage.getItem('focus-ritual-goals');
        return savedGoals ? JSON.parse(savedGoals) : [];
    });

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
        <section className="section">
            <div className="section-header">
                <h2 className="section-title">
                    <i className="fas fa-bullseye"></i>
                    Today's Goals
                </h2>
            </div>

            <div className="goals-container">
                <div className="goals-list space-y-2">
                    {goals.map((goal, index) => (
                        <div
                            key={index}
                            className="goal-item flex items-center justify-between p-3 rounded-lg"
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
        </section>
    );
};

export default GoalsSection; 