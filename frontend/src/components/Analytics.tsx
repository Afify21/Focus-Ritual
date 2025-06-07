import React, { useState, useEffect } from 'react';
import { format, subDays, addDays, addMonths, isBefore } from 'date-fns';
import { Habit } from '../types/habit';
import { FocusSession } from '../types/session';
import DataService from '../services/DataService';
import { FaBrain, FaHeartbeat, FaStar } from 'react-icons/fa';
import type { IconType } from 'react-icons';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const displayDateLabel = (rawDate: string, timeRange: 'week' | 'month' | 'year', index: number = 0) => {
    const date = new Date(rawDate);
    if (timeRange === 'week') {
      return format(date, 'EEE'); // Mon, Tue, etc.
    } else if (timeRange === 'month') {
      return `Week ${index + 1}`; // Week 1, Week 2, etc.
    } else if (timeRange === 'year') {
      return format(date, 'MMM'); // Jan, Feb, etc.
    } else {
      return format(date, 'MM/dd'); // Default case, though should be covered
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
    // Load data
    const loadData = async () => {
      setIsLoading(true); // Set loading true at the start of data load
      try {
        // Load habits and sessions from localStorage using DataService
        const loadedHabits = DataService.Habits.getHabits();
        const loadedSessions = DataService.Sessions.getSessions();

        setHabits(loadedHabits);
        setSessions(loadedSessions);

        // Get AI insights
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

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading analytics data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const reloadHabits = () => {
      setHabits(DataService.Habits.getHabits());
    };
    window.addEventListener('habits-updated', reloadHabits);
    return () => window.removeEventListener('habits-updated', reloadHabits);
  }, []);

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
    return periods.reverse(); // Reverse to get chronological order
  };

  // Helper function to calculate average completion rate for a given period
  const calculateAverageCompletionRate = (
    habits: Habit[],
    dates: string[]
  ): number => {
    if (habits.length === 0 || dates.length === 0) {
      return 0;
    }

    let totalCompletionSum = 0;
    let totalPossibleCompletions = 0;

    dates.forEach(date => {
      const habitsCompletedOnDate = habits.filter(habit => habit.completionHistory[date]).length;
      totalCompletionSum += habitsCompletedOnDate;
      totalPossibleCompletions += habits.length; // Each habit * number of days
    });

    return totalPossibleCompletions > 0 ? (totalCompletionSum / totalPossibleCompletions) * 100 : 0;
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
  const currentWeekDates = getDatesForRange('week').map(p => p.date);
  const previousWeekDates = getDatesForRange('week').map(p => format(subDays(new Date(p.date), 7), 'yyyy-MM-dd'));

  const currentWeekCompletionRate = calculateAverageCompletionRate(habits, currentWeekDates);
  const previousWeekCompletionRate = calculateAverageCompletionRate(habits, previousWeekDates);
  let percentageChange = 0;
  if (previousWeekCompletionRate > 0) {
    percentageChange = ((currentWeekCompletionRate - previousWeekCompletionRate) / previousWeekCompletionRate) * 100;
  } else if (currentWeekCompletionRate > 0) {
    percentageChange = 100;
  }

  const formattedPercentageChange = percentageChange.toFixed(0);
  const changeIndicator = percentageChange >= 0 ? '▲' : '▼';
  const changeColorClass = percentageChange >= 0 ? 'text-green-400' : 'text-red-400';

  // Calculate goals achieved
  const calculateGoalsAchieved = () => {
    const completedGoals = habits.filter(habit => habit.goalCompleted).length;
    const totalGoals = habits.length;
    return { completed: completedGoals, total: totalGoals };
  };

  const { completed: goalsAchieved, total: totalGoals } = calculateGoalsAchieved();

  // Render data visualizations
  const habitCompletionData = generateHabitCompletionData();
  const sessionDurationData = generateSessionDurationData();
  const maxCompletionRate = Math.max(...habitCompletionData.map(d => d.completionRate), 10);
  const maxSessionMinutes = Math.max(...sessionDurationData.map(d => d.minutes), 30);
  const topHabits = getTopHabits();

  // --- MOCK personalized insights (replace with real AI logic later) ---
  const personalizedInsights = [
    {
      icon: "brain",
      title: "Optimized Morning Routine",
      message: "Your meditation habit has consistently improved your morning productivity. Try moving it 15 minutes earlier to maximize focus before breakfast.",
      tags: ["Habit Optimization", "Productivity"]
    },
    {
      icon: "heart",
      title: "Energy Slump Pattern",
      message: "Your energy consistently dips between 2-4pm. Consider scheduling a short walk or protein-rich snack during this time to maintain performance.",
      tags: ["Energy", "Patterns"]
    }
    // Add more insights here, or generate dynamically from user data
  ];

  const iconComponents: Record<string, IconType> = {
    brain: FaBrain,
    heart: FaHeartbeat,
    star: FaStar
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = iconComponents[iconName] || FaStar;
    const Icon = IconComponent as React.ComponentType<{ className?: string }>;
    return <Icon className={`text-3xl ${iconName === 'brain' ? 'text-cyan-400' : iconName === 'heart' ? 'text-pink-400' : 'text-yellow-400'}`} />;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Streak Card */}
        <div className="gradient-bg p-6 rounded-lg shadow-lg border border-gray-800">
          <h3 className="text-lg font-medium mb-2">Current Streak</h3>
          <div className="text-3xl font-bold text-cyan-400">
            {topHabits[0]?.streak || 0} days
          </div>
          <div className="text-sm text-slate-400 mt-2">
            {topHabits[0]?.name || 'No active habits'}
          </div>
        </div>

        {/* Habit Completion Card */}
        <div className="gradient-bg p-6 rounded-lg shadow-lg border border-gray-800">
          <h3 className="text-lg font-medium mb-2">Habit Completion</h3>
          <div className="text-3xl font-bold text-cyan-400">
            {Math.round(currentWeekCompletionRate)}%
          </div>
          <div className="text-sm text-slate-400 mt-2">
            <span className={changeColorClass}>
              {changeIndicator} {formattedPercentageChange}% from last week
            </span>
          </div>
        </div>

        {/* Focus Time Card */}
        <div className="gradient-bg p-6 rounded-lg shadow-lg border border-gray-800">
          <h3 className="text-lg font-medium mb-2">Total Focus Time</h3>
          <div className="text-3xl font-bold text-cyan-400">
            {Math.round(sessionDurationData.reduce((sum, data) => sum + data.minutes, 0) / 60)}h
          </div>
          <div className="text-sm text-slate-400 mt-2">
            This {timeRange}
          </div>
        </div>

        {/* Goals Achieved Card */}
        <div className="gradient-bg p-6 rounded-lg shadow-lg border border-gray-800">
          <h3 className="text-lg font-medium mb-2">Goals Achieved</h3>
          <div className="text-3xl font-bold text-cyan-400">
            {goalsAchieved}
          </div>
          <div className="text-sm text-slate-400 mt-2">
            of {totalGoals} total goals
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTimeRange('week')}
          className={`px-3 py-1 rounded ${timeRange === 'week'
            ? 'bg-blue-500 text-white'
            : 'bg-slate-700/50 text-slate-300'
            }`}
        >
          Week
        </button>
        <button
          onClick={() => setTimeRange('month')}
          className={`px-3 py-1 rounded ${timeRange === 'month'
            ? 'bg-blue-500 text-white'
            : 'bg-slate-700/50 text-slate-300'
            }`}
        >
          Month
        </button>
        <button
          onClick={() => setTimeRange('year')}
          className={`px-3 py-1 rounded ${timeRange === 'year'
            ? 'bg-blue-500 text-white'
            : 'bg-slate-700/50 text-slate-300'
            }`}
        >
          Year
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habit Completion Rate Chart */}
        <div className="gradient-bg p-4 rounded-lg shadow-lg border border-gray-800 relative">
          <h3 className="text-lg font-medium mb-4">Habit Completion Rate <span className={`${changeColorClass} text-base ml-2`}>{changeIndicator} {formattedPercentageChange}%</span></h3>
          <div className="relative h-64">
            <div className="absolute left-0 top-0 h-full text-xs text-slate-400 w-8 text-right pr-1">
              <span style={{ top: `0px`, position: 'absolute', left: 0, width: '100%', transform: 'translateY(-50%)' }}>100%</span>
              <span style={{ top: `64px`, position: 'absolute', left: 0, width: '100%', transform: 'translateY(-50%)' }}>75%</span>
              <span style={{ top: `128px`, position: 'absolute', left: 0, width: '100%', transform: 'translateY(-50%)' }}>50%</span>
              <span style={{ top: `192px`, position: 'absolute', left: 0, width: '100%', transform: 'translateY(-50%)' }}>25%</span>
              <span style={{ top: `256px`, position: 'absolute', left: 0, width: '100%', transform: 'translateY(-50%)' }}>0%</span>
            </div>
            <div className="ml-8 h-full">
              <svg className="w-full h-full" viewBox={`0 0 ${habitCompletionData.length * 80} 300`} preserveAspectRatio="none">
                {/* Grid lines (optional) */}
                <line x1="0" y1="64" x2={habitCompletionData.length * 80} y2="64" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="0" y1="128" x2={habitCompletionData.length * 80} y2="128" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="0" y1="192" x2={habitCompletionData.length * 80} y2="192" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                <polyline
                  fill="none"
                  stroke="#00d9d9"
                  strokeWidth="2"
                  points={habitCompletionData.map((data, index) => {
                    const x = index * 80 + 40; // Center of each 80px wide slot
                    const y = 256 - (data.completionRate / maxCompletionRate) * 256; // Scale to 256px height, invert Y
                    return `${x},${y}`;
                  }).join(' ')}
                />

                {/* Data points (optional) */}
                {habitCompletionData.map((data, index) => {
                  const x = index * 80 + 40;
                  const y = 256 - (data.completionRate / maxCompletionRate) * 256;
                  return (
                    <circle key={index} cx={x} cy={y} r="3" fill="#00d9d9" />
                  );
                })}

                {/* X-axis labels */}
                {habitCompletionData.map((data, index) => {
                  const x = index * 80 + 40;
                  const y = 256 + 30; // Position below the graph
                  return (
                    <text
                      key={index}
                      x={x}
                      y={y}
                      fontSize="10"
                      fill="#FFFFFF"
                      textAnchor="middle"
                    >
                      {displayDateLabel(data.rawDate, timeRange, index)}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Focus Time Chart */}
        <div className="gradient-bg p-4 rounded-lg shadow-lg border border-gray-800 relative">
          <h3 className="text-lg font-medium mb-4">Focus Time (minutes)</h3>
          <div className="relative h-64">
            <div className="absolute left-0 top-0 h-full text-xs text-slate-400 w-8 text-right pr-1">
              {generateYAxisLabels(maxSessionMinutes, 60, 'm').map((label, index) => (
                <span
                  key={index}
                  style={{
                    top: label.positionY,
                    position: 'absolute',
                    left: 0,
                    width: '100%',
                    transform: 'translateY(-50%)'
                  }}
                >
                  {label.value}{label.value !== 0 ? 'm' : ''}
                </span>
              ))}
            </div>
            <div className="ml-8 h-full">
              <svg className="w-full h-full" viewBox={`0 0 ${sessionDurationData.length * 80} 300`} preserveAspectRatio="none">
                {/* Grid lines */}
                {generateYAxisLabels(maxSessionMinutes, 60, 'm').map((label, index) => {
                  const yPosition = parseFloat(label.positionY);
                  // Only draw grid lines for values other than 0 to avoid overlapping with chart base
                  if (label.value !== 0) {
                    return (
                      <line
                        key={`grid-${index}`}
                        x1="0"
                        y1={yPosition}
                        x2={sessionDurationData.length * 80}
                        y2={yPosition}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                      />
                    );
                  }
                  return null;
                })}

                <polyline
                  fill="none"
                  stroke="#00d9d9"
                  strokeWidth="2"
                  points={sessionDurationData.map((data, index) => {
                    const x = index * 80 + 40;
                    const y = 256 - (data.minutes / maxSessionMinutes) * 256;
                    return `${x},${y}`;
                  }).join(' ')}
                />

                {/* Data points (optional) */}
                {sessionDurationData.map((data, index) => {
                  const x = index * 80 + 40;
                  const y = 256 - (data.minutes / maxSessionMinutes) * 256;
                  return (
                    <circle key={index} cx={x} cy={y} r="3" fill="#00d9d9" />
                  );
                })}

                {/* X-axis labels */}
                {sessionDurationData.map((data, index) => {
                  const x = index * 80 + 40;
                  const y = 256 + 30; // Position below the graph
                  return (
                    <text
                      key={index}
                      x={x}
                      y={y}
                      fontSize="10"
                      fill="#FFFFFF"
                      textAnchor="middle"
                    >
                      {displayDateLabel(data.rawDate, timeRange, index)}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 