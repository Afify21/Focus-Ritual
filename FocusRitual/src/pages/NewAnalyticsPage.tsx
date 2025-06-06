import React, { useEffect, useRef, useState } from 'react';
import './NewAnalyticsPage.css'; // Import the CSS file
import Analytics from '../components/Analytics';

const NewAnalyticsPage: React.FC = () => {
    const particlesRef = useRef<HTMLDivElement>(null);
    const [habitCompletion, setHabitCompletion] = useState({
        'Morning Meditation (15 min)': true,
        'Exercise (30 min)': true,
        'Read 20 pages': false,
        'Journal Reflection': false,
    });

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
    }, []); // Empty dependency array means this runs once on mount

    const handleHabitCheck = (habitName: string) => {
        setHabitCompletion(prevState => ({
            ...prevState,
            [habitName]: !prevState[habitName as keyof typeof prevState]
        }));
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
                    <div className="date-indicator">14</div>
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

                    {/* Stats Cards moved here */}
                    <div className="stats-grid mb-6">
                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-title">Current Streak</div>
                                <div className="stat-icon">
                                    <i className="fas fa-fire"></i>
                                </div>
                            </div>
                            <div className="stat-value">14</div>
                            <div className="stat-change">
                                <i className="fas fa-arrow-up"></i> 3 days
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-title">Habits Completed</div>
                                <div className="stat-icon">
                                    <i className="fas fa-check-double"></i>
                                </div>
                            </div>
                            <div className="stat-value">85%</div>
                            <div className="stat-change negative">
                                <i className="fas fa-arrow-down"></i> 5% today
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-title">Goals Achieved</div>
                                <div className="stat-icon">
                                    <i className="fas fa-trophy"></i>
                                </div>
                            </div>
                            <div className="stat-value">3/5</div>
                            <div className="stat-change">
                                <i className="fas fa-clock"></i> 2 pending
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-title">Mood Score</div>
                                <div className="stat-icon">
                                    <i className="fas fa-smile-beam"></i>
                                </div>
                            </div>
                            <div className="stat-value">7.8</div>
                            <div className="stat-change">
                                <i className="fas fa-arrow-up"></i> 1.2 from avg
                            </div>
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
                                Your meditation habit has consistently improved your morning productivity. Try moving it 15
                                minutes earlier to maximize focus before breakfast.
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
                                Your energy consistently dips between 2-4pm. Consider scheduling a short walk or
                                protein-rich snack during this time to maintain performance.
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
                            <button className="btn btn-outline" title="Manage habits">
                                <i className="fas fa-sliders-h"></i> Manage
                            </button>
                            <button className="btn btn-primary" title="Add new habit">
                                <i className="fas fa-plus"></i> New
                            </button>
                        </div>
                    </div>

                    <div className="habit-tracker-grid">
                        <div className="habits-list">
                            {Object.entries(habitCompletion).map(([habitName, completed]) => (
                                <div className="habit-item" key={habitName}>
                                    <button
                                        className={`habit-check ${completed ? 'completed' : ''}`}
                                        onClick={() => handleHabitCheck(habitName)}
                                    >
                                        {completed && <i className="fas fa-check"></i>}
                                    </button>
                                    <div className="habit-name">{habitName}</div>
                                    <div className="habit-details">
                                        {/* Dummy streak for now */}
                                        <div className="habit-streak" title="Current streak">
                                            <i className="fas fa-fire"></i> {Math.floor(Math.random() * 10) + 1}
                                        </div>
                                        <div className="habit-actions">
                                            <button className="habit-action" title="Edit habit">
                                                <i className="fas fa-pen"></i>
                                            </button>
                                            <button className="habit-action" title="More options">
                                                <i className="fas fa-ellipsis-v"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="habit-calendar">
                            <div className="calendar-header">
                                <div className="calendar-title">June 2025</div>
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
                                        {/* Dummy days for now */}
                                        <div className={`day-number ${dayName === 'Mon' || dayName === 'Tue' || dayName === 'Wed' || dayName === 'Thu' ? 'completed' : ''} ${dayName === 'Fri' ? 'current' : ''}`}>
                                            {dayName === 'Sun' ? 1 : dayName === 'Mon' ? 2 : dayName === 'Tue' ? 3 : dayName === 'Wed' ? 4 : dayName === 'Thu' ? 5 : dayName === 'Fri' ? 6 : 7}
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