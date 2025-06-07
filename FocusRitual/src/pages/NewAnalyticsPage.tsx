import React, { useEffect, useRef, useState } from 'react';
import './NewAnalyticsPage.css'; // Import the CSS file
import Analytics from '../components/Analytics';
import DataService, { Habit, FocusSession, Achievement } from '../services/DataService';
import { format } from 'date-fns';

// Predefined categories for habits - taken from HabitTracker.tsx for consistency
const CATEGORIES = [
    { id: 'health', name: 'Health', color: 'bg-green-500' },
    { id: 'learning', name: 'Learning', color: 'bg-blue-500' },
    { id: 'work', name: 'Work', color: 'bg-purple-500' },
    { id: 'personal', name: 'Personal', color: 'bg-yellow-500' },
    { id: 'social', name: 'Social', color: 'bg-pink-500' },
    { id: 'other', name: 'Other', color: 'bg-gray-500' }
];

const NewAnalyticsPage: React.FC = () => {
    const particlesRef = useRef<HTMLDivElement>(null);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [sessions, setSessions] = useState<FocusSession[]>([]);
    const [aiInsights, setAiInsights] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [achievements, setAchievements] = useState<Achievement[]>([]);

    // State for new habit form
    const [showNewHabitForm, setShowNewHabitForm] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');
    const [newHabitCategory, setNewHabitCategory] = useState('other'); // Default category

    // State for editing habits
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [editedHabitName, setEditedHabitName] = useState('');
    const [editedHabitCategory, setEditedHabitCategory] = useState('');

    // State for deleting habits (confirmation modal)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [habitToDeleteId, setHabitToDeleteId] = useState<string | null>(null);

    useEffect(() => {
        // Particle animation logic
        const particlesContainer = particlesRef.current;
        if (particlesContainer) {
            // Remove existing particles before adding new ones
            particlesContainer.innerHTML = '';

            const particleCount = window.innerWidth < 768 ? 15 : 30;

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');

                const size = Math.random() * 4 + 2;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;

                particle.style.left = `${Math.random() * 100}%`;
                particle.style.top = `${Math.random() * 100}%`;

                particle.style.opacity = `${Math.random() * 0.5 + 0.3}`;

                const duration = Math.random() * 10 + 10;
                particle.style.animationDuration = `${duration}s`;

                particle.style.animationDelay = `${Math.random() * 10}s`;

                particlesContainer.appendChild(particle);
            }
        }

        // Data fetching logic
        const loadData = async () => {
            setIsLoading(true);
            try {
                const loadedHabits = DataService.Habits.getHabits();
                const loadedSessions = DataService.Sessions.getSessions();
                const loadedAchievements = DataService.Achievements.getAchievements();

                setHabits(loadedHabits);
                setSessions(loadedSessions);
                setAchievements(loadedAchievements);

                // Fetch AI insights
                try {
                    const response = await fetch('/api/insights/focus', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            focusSessions: loadedSessions,
                            habits: loadedHabits
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setAiInsights(data.insights);
                    }
                } catch (error) {
                    console.error('Error fetching AI insights:', error);
                }

            } catch (error) {
                console.error('Error loading analytics data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();

        // Listen for storage events to re-load data when localStorage changes
        const handleStorageChange = () => {
            loadData();
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };

    }, []); // Empty dependency array means this runs once on mount and on storage event

    // Helper functions for calculations
    const calculateCurrentStreak = () => {
        if (habits.length === 0) return 0;
        let maxStreak = 0;
        habits.forEach(habit => {
            if (habit.streak > maxStreak) {
                maxStreak = habit.streak;
            }
        });
        return maxStreak;
    };

    const calculateHabitsCompleted = () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const completedToday = habits.filter(habit => habit.completionHistory[today]).length;
        if (habits.length === 0) return '0%';
        return `${Math.round((completedToday / habits.length) * 100)}%`;
    };

    const calculateGoalsAchieved = () => {
        const unlockedAchievements = achievements.filter(ach => ach.unlocked).length;
        const totalAchievements = achievements.length;
        if (totalAchievements === 0) return '0/0';
        return `${unlockedAchievements}/${totalAchievements}`;
    };

    const currentStreak = calculateCurrentStreak();
    const habitsCompleted = calculateHabitsCompleted();
    const goalsAchieved = calculateGoalsAchieved();

    const handleHabitCheck = (habitId: string) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        DataService.Habits.toggleHabitCompletion(habitId, today);
        // DataService.Habits.toggleHabitCompletion dispatches a storage event,
        // which will trigger the useEffect to reload data.
    };

    const handleManageHabits = () => {
        // Implement navigation or modal for managing habits
        // For now, let's just log it
        console.log('Manage habits button clicked!');
        // Assuming there might be a route for habits or settings page
        // navigate('/habits'); 
    };

    const handleAddNewHabit = () => {
        // Show the form to add a new habit
        setShowNewHabitForm(true);
        setEditingHabit(null); // Ensure edit form is closed
    };

    const handleSaveNewHabit = () => {
        if (newHabitName.trim() === '') {
            alert('Habit name cannot be empty.');
            return;
        }

        DataService.Habits.addHabit({
            name: newHabitName.trim(),
            category: newHabitCategory,
            frequency: { type: 'daily' }, // Default to daily for simplicity here
            goalDuration: 7, // Default to 7 days
        });

        // Reset form and hide it
        setNewHabitName('');
        setNewHabitCategory('other');
        setShowNewHabitForm(false);
        // DataService.Habits.addHabit dispatches a storage event, which will trigger data reload.
    };

    const handleCancelNewHabit = () => {
        // Reset form and hide it
        setNewHabitName('');
        setNewHabitCategory('other');
        setShowNewHabitForm(false);
    };

    const handleEditHabit = (habit: Habit) => {
        setEditingHabit(habit);
        setEditedHabitName(habit.name);
        setEditedHabitCategory(habit.category);
        setShowNewHabitForm(false); // Ensure new habit form is closed
    };

    const handleSaveEditedHabit = () => {
        if (!editingHabit || editedHabitName.trim() === '') {
            alert('Habit name cannot be empty.');
            return;
        }

        const updatedHabit: Habit = {
            ...editingHabit,
            name: editedHabitName.trim(),
            category: editedHabitCategory,
        };

        DataService.Habits.updateHabit(updatedHabit);
        setEditingHabit(null); // Close edit form
        // DataService.Habits.updateHabit dispatches a storage event, which will trigger data reload.
    };

    const handleCancelEdit = () => {
        setEditingHabit(null);
        setEditedHabitName('');
        setEditedHabitCategory('');
    };

    const confirmDeleteHabit = (habitId: string) => {
        setHabitToDeleteId(habitId);
        setShowDeleteConfirmation(true);
    };

    const handleDeleteHabit = () => {
        if (habitToDeleteId) {
            DataService.Habits.deleteHabit(habitToDeleteId);
            setHabitToDeleteId(null);
            setShowDeleteConfirmation(false);
            // DataService.Habits.deleteHabit dispatches a storage event, which will trigger data reload.
        }
    };

    return (
        <div className="app-container">
            <div className="particles" ref={particlesRef}></div>

            <main className="main-content">
                <header className="header">
                    <div className="greeting">
                        <h1>Welcome Back, John!</h1>
                        <p>Your progress today is looking great! Here's what we've crafted for you.</p>
                    </div>
                    <div className="date-indicator">{format(new Date(), 'd')}</div>
                    <div className="search-container">
                        <div className="search-bar">
                            <i className="fas fa-search"></i>
                            <input type="text" placeholder="Search habits, goals..."></input>
                        </div>
                    </div>
                </header>

                {/* Analytics Section */}
                <section className="section">
                    <Analytics />
                </section>

                {/* Stats and AI Insights Section */}
                <section className="section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <i className="fas fa-robot"></i>
                            Your AI Insights
                        </h2>
                        <div className="section-actions">
                            <button className="btn btn-outline" title="View all insights">
                                <i className="fas fa-list"></i> View All
                            </button>
                        </div>
                    </div>

                    <div className="ai-insights">
                        <div className="insight-card">
                            <div className="insight-header">
                                <div className="insight-icon">
                                    <i className="fas fa-brain"></i>
                                </div>
                                <div className="insight-title">Optimized Morning Routine</div>
                            </div>
                            <div className="insight-text">
                                Your meditation habit has consistently improved your morning productivity. Try moving it 15 minutes earlier to maximize focus before breakfast.
                            </div>
                            <div className="insight-tag">Habit Optimization</div>
                            <div className="insight-tag">Productivity</div>
                        </div>
                        <div className="insight-card">
                            <div className="insight-header">
                                <div className="insight-icon">
                                    <i className="fas fa-heartbeat"></i>
                                </div>
                                <div className="insight-title">Energy Slump Pattern</div>
                            </div>
                            <div className="insight-text">
                                Your energy consistently dips between 2-4pm. Consider scheduling a short walk or protein-rich snack during this time to maintain performance.
                            </div>
                            <div className="insight-tag">Energy</div>
                            <div className="insight-tag">Patterns</div>
                        </div>
                    </div>
                </section>

                <section className="section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <i className="fas fa-calendar-check"></i>
                            Today's Habits
                        </h2>
                        <div className="section-actions">
                            <button className="btn btn-outline" title="Manage habits" onClick={handleManageHabits}>
                                <i className="fas fa-sliders-h"></i> Manage
                            </button>
                            <button className="btn btn-primary" title="Add new habit" onClick={handleAddNewHabit}>
                                <i className="fas fa-plus"></i> New
                            </button>
                        </div>
                    </div>

                    {showNewHabitForm && (
                        <div className="gradient-bg p-4 rounded-lg mb-6 shadow-xl border border-gray-800 relative">
                            <h3 className="text-lg font-semibold mb-3">Add New Habit</h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Habit Name (e.g., Read 20 pages)"
                                    className="w-full px-3 py-2 rounded-md bg-gray-900/60 border border-teal-500 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                                    value={newHabitName}
                                    onChange={(e) => setNewHabitName(e.target.value)}
                                />
                                <select
                                    className="w-full px-3 py-2 rounded-md bg-gray-900/60 border border-teal-500 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                                    value={newHabitCategory}
                                    onChange={(e) => setNewHabitCategory(e.target.value)}
                                >
                                    {CATEGORIES.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition-colors border border-gray-600"
                                        onClick={handleCancelNewHabit}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded-md bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-lg"
                                        onClick={handleSaveNewHabit}
                                    >
                                        Add Habit
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="habit-tracker-grid">
                        <div className="habits-list">
                            {habits.length > 0 ? (
                                habits.map(habit => (
                                    <div className="habit-item" key={habit.id}>
                                        <button
                                            className={`habit-check ${habit.completionHistory[format(new Date(), 'yyyy-MM-dd')] ? 'completed' : ''}`}
                                            onClick={() => handleHabitCheck(habit.id)}
                                        >
                                            {habit.completionHistory[format(new Date(), 'yyyy-MM-dd')] && <i className="fas fa-check"></i>}
                                        </button>
                                        <div className="habit-name">{habit.name}</div>
                                        <div className="habit-details">
                                            <div className="habit-streak" title="Current streak">
                                                <i className="fas fa-fire"></i> {habit.streak}
                                            </div>
                                            <div className="habit-actions">
                                                <button className="habit-action" title="Edit habit" onClick={() => handleEditHabit(habit)}>
                                                    <i className="fas fa-pen"></i>
                                                </button>
                                                <button className="habit-action" title="More options" onClick={() => confirmDeleteHabit(habit.id)}>
                                                    <i className="fas fa-ellipsis-v"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No habits added yet. Start by clicking 'New' to add your first habit!</p>
                            )}
                        </div>

                        {/* Edit Habit Form */}
                        {editingHabit && (
                            <div className="gradient-bg p-4 rounded-lg mb-6 shadow-xl border border-gray-800 relative">
                                <h3 className="text-lg font-semibold mb-3">Edit Habit</h3>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Habit Name"
                                        className="w-full px-3 py-2 rounded-md bg-gray-900/60 border border-teal-500 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                                        value={editedHabitName}
                                        onChange={(e) => setEditedHabitName(e.target.value)}
                                    />
                                    <select
                                        className="w-full px-3 py-2 rounded-md bg-gray-900/60 border border-teal-500 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                                        value={editedHabitCategory}
                                        onChange={(e) => setEditedHabitCategory(e.target.value)}
                                    >
                                        {CATEGORIES.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition-colors border border-gray-600"
                                            onClick={handleCancelEdit}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-4 py-2 rounded-md bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-lg"
                                            onClick={handleSaveEditedHabit}
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Delete Confirmation Modal */}
                        {showDeleteConfirmation && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="gradient-bg p-6 rounded-lg shadow-xl text-white border border-gray-800 relative">
                                    <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                                    <p className="mb-6">Are you sure you want to delete this habit?</p>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white transition-colors border border-gray-600"
                                            onClick={() => setShowDeleteConfirmation(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white transition-colors shadow-lg"
                                            onClick={handleDeleteHabit}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="habit-calendar">
                            <div className="calendar-header">
                                <div className="calendar-title">{format(new Date(), 'MMMM yyyy')}</div>
                                <div className="calendar-nav">
                                    <button className="calendar-nav-btn" title="Previous month">
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                    <button className="calendar-nav-btn" title="Next month">
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="calendar-grid">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
                                    <div className="calendar-day" key={dayName}>
                                        <div className="day-name">{dayName}</div>
                                        {/* Dummy days for now - needs proper calendar logic */}
                                        <div className={`day-number`}>
                                            {/* Logic to display actual day numbers */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <i className="fas fa-trophy"></i>
                            Active Challenges
                        </h2>
                        <div className="section-actions">
                            <button className="btn btn-primary" title="Browse more challenges">
                                <i className="fas fa-compass"></i> Browse
                            </button>
                        </div>
                    </div>

                    <div className="challenges-grid">
                        <div className="challenge-card">
                            <div className="challenge-badge badge-free">Free</div>
                            <h3 className="challenge-title">21-Day Meditation Journey</h3>
                            <div className="challenge-desc">
                                Build a consistent meditation practice with daily guided sessions starting from just 5
                                minutes.
                            </div>
                            <div className="challenge-progress">
                                <div className="progress-text">
                                    <span>Progress</span>
                                    <span>13/21 days</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '62%' }}></div>
                                </div>
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%' }}>
                                <i className="fas fa-play"></i> Continue
                            </button>
                        </div>
                        <div className="challenge-card">
                            <div className="challenge-badge badge-premium">Premium</div>
                            <h3 className="challenge-title">Productivity Power-Up</h3>
                            <div className="challenge-desc">
                                Advanced techniques to double your productivity without burning out, based on your personal
                                patterns.
                            </div>
                            <div className="challenge-progress">
                                <div className="progress-text">
                                    <span>Progress</span>
                                    <span>5/14 days</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '36%' }}></div>
                                </div>
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%' }}>
                                <i className="fas fa-play"></i> Continue
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default NewAnalyticsPage; 