import React, { useEffect, useRef, useState } from 'react';
import './NewAnalyticsPage.css';
import DataService, { Habit, FocusSession, Achievement } from '../services/DataService';
import { format, subDays, addDays, addMonths, isBefore, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { PlusIcon, TrophyIcon, ChevronDownIcon, ChevronUpIcon, FireIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import GoalsSection from '../components/GoalsSection';
import { useNavigate, useLocation } from 'react-router-dom';
import HabitStats from '../components/HabitStats';
import { FaBrain, FaHeartbeat, FaStar } from 'react-icons/fa';

const NewAnalyticsPage: React.FC = () => {
    const particlesRef = useRef<HTMLDivElement>(null);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [sessions, setSessions] = useState<FocusSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [newGoal, setNewGoal] = useState('');
    const [showAllChallenges, setShowAllChallenges] = useState(false);
    const [viewMode, setViewMode] = useState<'active' | 'all'>('active');
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
    const [goals, setGoals] = useState<string[]>(() => {
        const savedGoals = localStorage.getItem('focus-ritual-goals');
        return savedGoals ? JSON.parse(savedGoals) : [];
    });
    const navigate = useNavigate();
    const location = useLocation();

    // Helper function to display date labels
    const displayDateLabel = (rawDate: string, timeRange: 'week' | 'month' | 'year', index: number = 0) => {
        const date = new Date(rawDate);
        if (timeRange === 'week') {
            return format(date, 'EEEEEE'); // Mo, Tu, etc.
        } else if (timeRange === 'month') {
            return `Wk ${index + 1}`; // Wk 1, Wk 2, etc.
        } else if (timeRange === 'year') {
            return format(date, 'MMM'); // Jan, Feb, etc.
        } else {
            return format(date, 'MM/dd'); // Default case
        }
    };

    // Helper function to generate Y-axis labels at a specific interval
    const generateYAxisLabels = (maxValue: number, interval: number, suffix: string, svgHeight: number = 256) => {
        const labels = [];
        const effectiveMaxValue = Math.max(maxValue, interval, 1); // Ensure effectiveMaxValue is at least 1 to avoid division by zero

        // For values from 0 up to maxValue, generate labels at `interval` increments
        for (let i = 0; i <= maxValue; i += interval) {
            const yPx = (i / effectiveMaxValue) * svgHeight; // Scaled value from bottom
            const svgY = svgHeight - yPx; // Inverted to SVG top-down coordinate for the line/center of label

            labels.push({
                value: i,
                positionY: `${svgY}px`
            });
        }

        // Ensure maxValue is explicitly included if not a multiple of interval
        if (maxValue > 0 && maxValue % interval !== 0) {
            const yPx = (maxValue / effectiveMaxValue) * svgHeight;
            const svgY = svgHeight - yPx;
            if (!labels.find(label => label.value === maxValue)) {
                labels.push({ value: maxValue, positionY: `${svgY}px` });
            }
        }

        // Ensure 0 is always included and at the very bottom
        if (!labels.find(label => label.value === 0)) {
            labels.push({ value: 0, positionY: `${svgHeight}px` }); // 0 value is at the bottom of the SVG
        }

        return labels.sort((a, b) => a.value - b.value);
    };

    useEffect(() => {
        // Set showAllChallenges to true if we're on the /challenges route
        if (location.pathname === '/challenges') {
            setShowAllChallenges(true);
        }
        
        // Load habits from localStorage
        const savedHabits = DataService.Habits.getHabits();
        setHabits(savedHabits);
        
        // Load sessions from localStorage
        const savedSessions = DataService.Sessions.getSessions();
        setSessions(savedSessions);
        
        // Load and initialize achievements
        let achievementsData = DataService.Achievements.getAchievements();
        if (achievementsData.length === 0) {
            achievementsData = DataService.Achievements.initializeAchievements();
        }
        setAchievements(achievementsData);
        
        // Check for new achievements based on current data
        DataService.Achievements.checkForNewAchievements();
        
        setIsLoading(false);
    }, [location.pathname]);

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

    // Toggle showing all challenges
    const toggleShowAllChallenges = () => {
        setShowAllChallenges(!showAllChallenges);
        // Update URL without full page refresh
        if (!showAllChallenges) {
            navigate('/challenges', { replace: true });
        } else {
            navigate('/analytics', { replace: true });
        }
    };

    // Get dates for a specified range
    const getDatesForRange = (timeRange: 'week' | 'month' | 'year'): { date: string, periodStart: Date }[] => {
        const periods: { date: string, periodStart: Date }[] = [];
        const today = new Date();

        if (timeRange === 'week') {
            for (let i = 6; i >= 0; i--) { // Last 7 days including today
                const date = subDays(today, i);
                periods.push({ date: format(date, 'yyyy-MM-dd'), periodStart: date });
            }
        } else if (timeRange === 'month') {
            // Get the last 4 weeks (28 days) or so, representing a month
            for (let i = 3; i >= 0; i--) { // 4 weeks
                const date = subDays(today, i * 7); // Start of each week
                periods.push({ date: format(date, 'yyyy-MM-dd'), periodStart: date });
            }
        } else if (timeRange === 'year') {
            // Get the last 12 months
            for (let i = 11; i >= 0; i--) {
                const date = new Date(today.getFullYear(), today.getMonth() - i, 1); // Start of each month
                periods.push({ date: format(date, 'yyyy-MM-dd'), periodStart: date });
            }
        }
        return periods; 
    };

    // Generate habit completion data for chart
    const generateHabitCompletionData = () => {
        const periods = getDatesForRange(timeRange);
        const chartData: { date: string; rawDate: string; completionRate: number }[] = [];

        periods.forEach((period, index) => {
            let totalCompletedInPeriod = 0;
            let totalPossibleInPeriod = 0;
            let currentPeriodDates: string[] = [];

            if (timeRange === 'week') {
                currentPeriodDates.push(period.date); // Already daily
            } else if (timeRange === 'month') {
                // For month view, each period.date is the start of a week. Get 7 days from this start.
                for (let i = 0; i < 7; i++) {
                    currentPeriodDates.push(format(addDays(period.periodStart, i), 'yyyy-MM-dd'));
                }
            } else if (timeRange === 'year') {
                // For year view, each period.date is the start of a month. Get all days in this month.
                const monthStart = period.periodStart;
                const nextMonthStart = addMonths(monthStart, 1);
                let currentDate = monthStart;
                while (isBefore(currentDate, nextMonthStart)) {
                    currentPeriodDates.push(format(currentDate, 'yyyy-MM-dd'));
                    currentDate = addDays(currentDate, 1);
                }
            }

            currentPeriodDates.forEach(date => {
                const habitsCompletedOnDate = habits.filter(habit => habit.completionHistory[date]).length;
                totalCompletedInPeriod += habitsCompletedOnDate;
                totalPossibleInPeriod += habits.length;
            });

            const completionRate = totalPossibleInPeriod > 0 ? (totalCompletedInPeriod / totalPossibleInPeriod) * 100 : 0;

            chartData.push({
                date: period.date, // This will be used for display, potentially reformatted by displayDateLabel
                rawDate: period.date, // Keep raw date for displayDateLabel
                completionRate: Math.round(completionRate) || 0
            });
        });
        return chartData;
    };

    // Generate session duration data for chart
    const generateSessionDurationData = () => {
        const periods = getDatesForRange(timeRange);
        const chartData: { date: string; rawDate: string; minutes: number }[] = [];

        periods.forEach((period, index) => {
            let totalMinutesInPeriod = 0;
            let currentPeriodDates: string[] = [];

            if (timeRange === 'week') {
                currentPeriodDates.push(period.date);
            } else if (timeRange === 'month') {
                for (let i = 0; i < 7; i++) {
                    currentPeriodDates.push(format(addDays(period.periodStart, i), 'yyyy-MM-dd'));
                }
            } else if (timeRange === 'year') {
                const monthStart = period.periodStart;
                const nextMonthStart = addMonths(monthStart, 1);
                let currentDate = monthStart;
                while (isBefore(currentDate, nextMonthStart)) {
                    currentPeriodDates.push(format(currentDate, 'yyyy-MM-dd'));
                    currentDate = addDays(currentDate, 1);
                }
            }

            currentPeriodDates.forEach(date => {
                const sessionsForDate = sessions.filter(s => {
                    const sessionDate = format(new Date(s.startTime), 'yyyy-MM-dd');
                    return sessionDate === date && s.completed;
                });

                const totalMinutes = sessionsForDate.reduce((sum, session) => {
                    return sum + (session.duration / 60);
                }, 0);
                totalMinutesInPeriod += totalMinutes;
            });

            chartData.push({
                date: period.date,
                rawDate: period.date,
                minutes: Math.round(totalMinutesInPeriod)
            });
        });
        return chartData;
    };

    // Get habits with highest streaks
    const getTopHabits = (): Habit[] => {
        return [...habits]
            .sort((a, b) => b.streak - a.streak)
            .slice(0, 3);
    };

    // Calculate habit completion percentage change
    const calculateCompletionChange = (): number => {
        const currentWeekDates = getDatesForRange('week').map(p => p.date);
        
        // Current week average
        const currentCompletionRate = habits.length > 0 ? 
            (currentWeekDates.reduce((sum, date) => {
                const completedCount = habits.filter(h => h.completionHistory[date]).length;
                return sum + (completedCount / habits.length);
            }, 0) / currentWeekDates.length) * 100 : 0;
        
        // Previous week dates
        const previousWeekDates = currentWeekDates.map(date => {
            const prevDate = subDays(new Date(date), 7);
            return format(prevDate, 'yyyy-MM-dd');
        });
        
        // Previous week average
        const previousCompletionRate = habits.length > 0 ? 
            (previousWeekDates.reduce((sum, date) => {
                const completedCount = habits.filter(h => h.completionHistory[date]).length;
                return sum + (completedCount / habits.length);
            }, 0) / previousWeekDates.length) * 100 : 0;
        
        if (previousCompletionRate === 0) return 0;
        return ((currentCompletionRate - previousCompletionRate) / previousCompletionRate) * 100;
    };

    // Calculate goals achieved
    const calculateGoalsAchieved = (): { achieved: number, total: number } => {
        let achieved = 0;
        let total = 0;
        
        habits.forEach(habit => {
            if (habit.goalDuration > 0) {
                total++;
                if (habit.goalCompleted) {
                    achieved++;
                }
            }
        });
        
        return { achieved, total };
    };

    // REVERSED DATA FOR CHARTS
    const habitCompletionData = generateHabitCompletionData().reverse();
    const sessionDurationData = generateSessionDurationData().reverse();
    
    // Determine max values for charts
    const maxCompletionRate = 100;
    const maxSessionMinutes = Math.max(60, ...sessionDurationData.map(d => d.minutes));
    
    // Calculate stats for summary cards
    const totalFocusTimeHours = sessions.filter(s => s.completed).reduce((sum, s) => sum + (s.duration / 3600), 0);
    const completionChange = calculateCompletionChange();
    const { achieved: goalsAchieved, total: totalGoals } = calculateGoalsAchieved();
    const topHabits = getTopHabits();
    const currentStreak = topHabits.length > 0 ? topHabits[0].streak : 0;
    const currentStreakHabit = topHabits.length > 0 ? topHabits[0].name : 'N/A';

    const lastWeekCompletionRate = () => {
        const lastSevenDays = getDatesForRange('week').map(p => p.date);
        let totalCompleted = 0;
        let totalPossible = 0;
        lastSevenDays.forEach(date => {
            totalPossible += habits.length;
            habits.forEach(h => {
                if(h.completionHistory[date]) totalCompleted++;
            })
        });
        return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    }

    const TodaysHabits: React.FC = () => {
        const today = new Date();
        const [currentMonth, setCurrentMonth] = useState(today);
      
        const renderHeader = () => {
          return (
            <div className="calendar-header">
              <div className="calendar-title">
                {format(currentMonth, 'MMMM yyyy')}
              </div>
            </div>
          );
        };
      
        const renderDays = () => {
            const days = [];
            const date = startOfWeek(currentMonth, { weekStartsOn: 1 }); // Start week on Monday
        
            for (let i = 0; i < 7; i++) {
              days.push(
                <div className="day-name" key={i}>
                  {format(addDays(date, i), 'EEE')}
                </div>
              );
            }
        
            return <div className="calendar-grid days">{days}</div>;
        };
      
        return (
            <div className="todays-habits-container">
                <div className="habits-list">
                    {habits.slice(0, 2).map(habit => (
                        <div key={habit.id} className="habit-item">
                            <CheckCircleIcon className="habit-check-icon" />
                            <span>{habit.name}</span>
                        </div>
                    ))}
                </div>
                <div className="habit-calendar">
                    {renderHeader()}
                    {renderDays()}
                </div>
            </div>
        );
    }
    
    // Filter for active challenges (achievements that are not unlocked yet)
    const activeChallenges = achievements.filter(ach => !ach.unlocked);
    
    // Get recently completed challenges (unlocked in the last 30 days)
    const recentlyCompleted = achievements.filter(ach => {
        if (!ach.unlocked || !ach.date) return false;
        const completedDate = new Date(ach.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return completedDate >= thirtyDaysAgo;
    });

    // Get all completed achievements
    const completedAchievements = achievements.filter(ach => ach.unlocked);

    // Determine which challenges to display based on view mode and showAllChallenges
    const displayedChallenges = (() => {
        if (!showAllChallenges) {
            return activeChallenges.slice(0, 3);
        }
        
        if (viewMode === 'active') {
            return activeChallenges;
        } else {
            return achievements; // All achievements
        }
    })();

    // Generate page title based on mode
    const challengesTitle = (() => {
        if (!showAllChallenges) return "Active Challenges";
        
        if (viewMode === 'active') {
            return "All Active Challenges";
        } else {
            return "All Achievements";
        }
    })();

    return (
        <div className="app-container">
            <div className="particles" ref={particlesRef}></div>

            <main className="main-content">
                <div className="header-section">
                    <div>
                        <h1 className="welcome-title">Welcome Back, John!</h1>
                        <p className="welcome-subtitle">Your progress today is looking great! Here's what we've crafted for you.</p>
                    </div>
                </div>

                {/* Main Dashboard Content */}
                {!showAllChallenges && (
                    <>
                        {/* Stats Summary Cards */}
                        <div className="stats-grid mb-8">
                            <div className="stat-card-item">
                                <h3 className="stat-title">Current Streak</h3>
                                <div className="stat-value">{currentStreak} <span className="stat-unit">days</span></div>
                                <p className="stat-description">{currentStreakHabit}</p>
                            </div>
                            <div className="stat-card-item">
                                <h3 className="stat-title">Habit Completion</h3>
                                <div className="stat-value">{lastWeekCompletionRate()}%</div>
                                <p className={`stat-description ${completionChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {completionChange >= 0 ? '▲' : '▼'} {Math.round(Math.abs(completionChange))}% from last week
                                </p>
                            </div>
                            <div className="stat-card-item">
                                <h3 className="stat-title">Total Focus Time</h3>
                                <div className="stat-value">{Math.round(totalFocusTimeHours)}h</div>
                                <p className="stat-description">This week</p>
                            </div>
                            <div className="stat-card-item">
                                <h3 className="stat-title">Goals Achieved</h3>
                                <div className="stat-value">{goalsAchieved}</div>
                                <p className="stat-description">of {totalGoals} total goals</p>
                            </div>
                        </div>

                        {/* Time Range Selector */}
                        <div className="flex gap-2 mb-4">
                            {['Week', 'Month', 'Year'].map(range => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range.toLowerCase() as 'week' | 'month' | 'year')}
                                    className={`time-range-btn ${timeRange === range.toLowerCase() ? 'active' : ''}`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="chart-card">
                                <h3 className="chart-title">Habit Completion Rate <span className={completionChange >= 0 ? 'text-green-400' : 'text-red-400'}>▲ {Math.round(completionChange)}%</span></h3>
                                <div className="chart-container h-[250px]">
                                    <svg className="w-full h-full" viewBox={`0 0 ${habitCompletionData.length * 80} 256`} preserveAspectRatio="none">
                                        {/* Y-axis labels */}
                                        {[0, 25, 50, 75, 100].map(val => (
                                            <text key={val} x="0" y={256 - (val / 100) * 256 + 4} fontSize="10" fill="#a0aec0">{val}%</text>
                                        ))}
                                        <polyline
                                            fill="none"
                                            stroke="#04d9d9"
                                            strokeWidth="2"
                                            points={habitCompletionData.map((data, index) => {
                                                const x = index * (80) + 40;
                                                const y = 256 - (data.completionRate / maxCompletionRate) * 256;
                                                return `${x},${y}`;
                                            }).join(' ')}
                                        />
                                        {/* X-axis labels */}
                                        {habitCompletionData.map((data, index) => {
                                            const x = index * 80 + 40;
                                            return (
                                                <text key={index} x={x} y={256 + 20} fontSize="10" fill="#a0aec0" textAnchor="middle">
                                                    {displayDateLabel(data.rawDate, timeRange, index)}
                                                </text>
                                            );
                                        })}
                                    </svg>
                                </div>
                            </div>
                            <div className="chart-card">
                                <h3 className="chart-title">Focus Time (minutes)</h3>
                                <div className="chart-container h-[250px]">
                                    <svg className="w-full h-full" viewBox={`0 0 ${sessionDurationData.length * 80} 256`} preserveAspectRatio="none">
                                        {/* Y-axis labels */}
                                        {generateYAxisLabels(maxSessionMinutes, 180, 'm', 256).map(label => (
                                            <text key={label.value} x="0" y={label.positionY} fontSize="10" fill="#a0aec0">{label.value}m</text>
                                        ))}
                                        <polyline
                                            fill="none"
                                            stroke="#04d9d9"
                                            strokeWidth="2"
                                            points={sessionDurationData.map((data, index) => {
                                                const x = index * 80 + 40;
                                                const y = 256 - (data.minutes / maxSessionMinutes) * 256;
                                                return `${x},${y}`;
                                            }).join(' ')}
                                        />
                                        {/* X-axis labels */}
                                        {sessionDurationData.map((data, index) => {
                                            const x = index * 80 + 40;
                                            return (
                                                <text key={index} x={x} y={256 + 20} fontSize="10" fill="#a0aec0" textAnchor="middle">
                                                    {displayDateLabel(data.rawDate, timeRange, index)}
                                                </text>
                                            );
                                        })}
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* AI Insights Section */}
                        <div className="section">
                            <div className="section-header">
                                <h2 className="section-title">Your AI Insights</h2>
                                <button className="btn-outline">View All</button>
                            </div>
                            <div className="ai-insights-grid">
                                <div className="insight-card-item">
                                    <FaBrain className="insight-icon" />
                                    <h4 className="insight-title">Optimized Morning Routine</h4>
                                    <p className="insight-text">Your meditation habit has consistently improved your morning productivity. Try moving it 15 minutes earlier to maximize focus before breakfast.</p>
                                    <div className="insight-tags">
                                        <span className="insight-tag">Habit Optimization</span>
                                        <span className="insight-tag">Productivity</span>
                                    </div>
                                </div>
                                <div className="insight-card-item">
                                    <FaHeartbeat className="insight-icon" />
                                    <h4 className="insight-title">Energy Slump Pattern</h4>
                                    <p className="insight-text">Your energy consistently dips between 2-4pm. Consider scheduling a short walk or protein-rich snack during this time to maintain performance.</p>
                                    <div className="insight-tags">
                                        <span className="insight-tag">Energy</span>
                                        <span className="insight-tag">Patterns</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Today's Habits Section */}
                        <div className="section">
                            <div className="section-header">
                                <h2 className="section-title">Today's Habits</h2>
                            </div>
                            <TodaysHabits/>
                        </div>

                        {/* Challenges Section */}
                        <section className="section">
                            <div className="section-header">
                                <h2 className="section-title">
                                    <i className="fas fa-trophy"></i>
                                    {challengesTitle}
                                </h2>
                                <div className="flex items-center space-x-4">
                                    {showAllChallenges && (
                                        <div className="view-mode-toggle">
                                            <button
                                                onClick={() => setViewMode('active')}
                                                className={`view-mode-button ${viewMode === 'active' ? 'active' : ''}`}
                                            >
                                                Active
                                            </button>
                                            <button
                                                onClick={() => setViewMode('all')}
                                                className={`view-mode-button ${viewMode === 'all' ? 'active' : ''}`}
                                            >
                                                All
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        onClick={toggleShowAllChallenges}
                                        className="flex items-center text-sm text-slate-400 hover:text-white transition-colors"
                                    >
                                        {showAllChallenges ? (
                                            <>
                                                <span>Show Less</span>
                                                <ChevronUpIcon className="w-4 h-4 ml-1" />
                                            </>
                                        ) : (
                                            <>
                                                <span>View All</span>
                                                <ChevronDownIcon className="w-4 h-4 ml-1" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            
                            {isLoading ? (
                                <p>Loading challenges...</p>
                            ) : displayedChallenges.length > 0 ? (
                                <div className={`challenges-grid ${showAllChallenges ? 'show-all-grid' : ''}`}>
                                    {displayedChallenges.map(challenge => (
                                        <div key={challenge.id} className={`challenge-item bg-gray-800 p-4 rounded-lg ${challenge.unlocked ? 'completed' : ''}`}>
                                            <div className="flex items-center mb-2">
                                                <span className="text-2xl mr-2">{challenge.icon}</span>
                                                <h3 className={`font-semibold ${challenge.unlocked ? 'text-yellow-300' : ''}`}>
                                                    {challenge.title}
                                                    {challenge.unlocked && <span className="ml-2 text-xs bg-yellow-500/20 px-2 py-0.5 rounded-full">Completed</span>}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-gray-300 mb-2">{challenge.description}</p>
                                            {challenge.progress !== undefined && challenge.threshold !== undefined && (
                                                <div className="mt-2">
                                                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                                                        <div 
                                                            className={`h-2.5 rounded-full ${challenge.unlocked ? 'bg-yellow-500' : 'bg-blue-500'}`}
                                                            style={{ width: `${Math.min(100, (challenge.progress / challenge.threshold) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1 text-right">
                                                        {challenge.progress} / {challenge.threshold}
                                                        {challenge.unlocked && challenge.date && (
                                                            <span className="ml-2 text-gray-500">
                                                                • {format(new Date(challenge.date), 'MMM d, yyyy')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {challenge.unlocked && !challenge.progress && challenge.date && (
                                                <div className="text-xs text-gray-500 mt-2">
                                                    Completed on {format(new Date(challenge.date), 'MMMM d, yyyy')}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
                                        <TrophyIcon className="w-8 h-8 text-yellow-500" />
                                    </div>
                                    <h3 className="text-xl font-medium mb-2">All Challenges Completed!</h3>
                                    <p className="text-gray-400">Great job! You've completed all available challenges.</p>
                                </div>
                            )}
                            
                            {!showAllChallenges && recentlyCompleted.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-medium mb-3 text-gray-300">Recently Completed</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {recentlyCompleted.slice(0, 3).map(achievement => (
                                            <div key={achievement.id} className="bg-gray-800 bg-opacity-50 p-3 rounded-lg flex items-center">
                                                <span className="text-2xl mr-3">{achievement.icon}</span>
                                                <div>
                                                    <h4 className="font-medium text-yellow-300">{achievement.title}</h4>
                                                    <p className="text-xs text-gray-400">
                                                        {achievement.date ? format(new Date(achievement.date), 'MMM d, yyyy') : 'Recently'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    </>
                )}

                {showAllChallenges && (
                    <section className="section">
                        {/* ... (keep existing challenges JSX for when 'showAll' is true) */}
                    </section>
                )}
            </main>
        </div>
    );
};

export default NewAnalyticsPage; 