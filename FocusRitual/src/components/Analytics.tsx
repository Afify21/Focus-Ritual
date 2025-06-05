import React, { useState, useEffect } from 'react';
import { format, subDays, isThisWeek, isThisMonth, differenceInDays } from 'date-fns';
import { ChartBarIcon, CalendarIcon, ClockIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/solid';
import DataService, { Habit, FocusSession, CalendarEvent } from '../services/DataService';
import { useTheme } from '../context/ThemeContext';

type TimeRange = 'week' | 'month' | 'year';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentTheme } = useTheme();

  useEffect(() => {
    // Load data
    const loadData = () => {
      setIsLoading(true);
      const habits = DataService.Habits.getHabits();
      const sessions = DataService.Sessions.getSessions();
      const events = DataService.Events.getEvents();

      setHabits(habits);
      setSessions(sessions);
      setEvents(events);
      setIsLoading(false);
    };

    loadData();

    // Listen for storage events
    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date = new Date()): string => {
    return date.toISOString().split('T')[0];
  };

  // Get an array of dates for the selected time range
  const getDates = () => {
    const today = new Date();
    const dates = [];
    let daysToInclude = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;

    for (let i = daysToInclude - 1; i >= 0; i--) {
      const date = subDays(today, i);
      dates.push(formatDate(date));
    }

    return dates;
  };

  // Filter data based on the selected time range
  const filterByTimeRange = <T extends { date: string } | FocusSession>(items: T[]): T[] => {
    const now = new Date();

    return items.filter(item => {
      const itemDate = new Date(('date' in item)
        ? item.date
        : (item as FocusSession).startTime);

      if (timeRange === 'week') {
        return isThisWeek(itemDate);
      } else if (timeRange === 'month') {
        return isThisMonth(itemDate);
      } else {
        return differenceInDays(now, itemDate) <= 365;
      }
    });
  };

  // Calculate habit completion rate
  const calculateHabitCompletionRate = (): number => {
    if (habits.length === 0) return 0;

    const dates = getDates();
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

  // Calculate total focus time in hours
  const calculateTotalFocusTime = (): number => {
    const filteredSessions = filterByTimeRange(sessions);
    const totalSeconds = filteredSessions.reduce((sum, session) => {
      return sum + (session.completed ? session.duration : 0);
    }, 0);

    return Math.round(totalSeconds / 3600 * 10) / 10; // Convert to hours with one decimal
  };

  // Calculate average session productivity
  const calculateAverageProductivity = (): number => {
    const filteredSessions = filterByTimeRange(sessions);
    const sessionsWithFeedback = filteredSessions.filter(
      s => s.completed && s.feedback && typeof s.feedback.productivity === 'number'
    );

    if (sessionsWithFeedback.length === 0) return 0;

    const total = sessionsWithFeedback.reduce(
      (sum, session) => sum + (session.feedback?.productivity || 0),
      0
    );

    return Math.round((total / sessionsWithFeedback.length) * 10) / 10;
  };

  // Count upcoming events
  const countUpcomingEvents = (): number => {
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now;
    }).length;
  };

  // Generate habit completion data for chart
  const generateHabitCompletionData = () => {
    const dates = getDates();

    return dates.map(date => {
      const displayDate = format(new Date(date), 'MM/dd');
      const totalHabits = habits.length;
      const completedHabits = habits.filter(habit => habit.completionHistory[date]).length;
      const completionRate = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

      return {
        date: displayDate,
        rawDate: date,
        completionRate: Math.round(completionRate)
      };
    });
  };

  // Generate session duration data for chart
  const generateSessionDurationData = () => {
    const dates = getDates();

    return dates.map(date => {
      const displayDate = format(new Date(date), 'MM/dd');
      const sessionsForDate = sessions.filter(s => {
        const sessionDate = new Date(s.startTime).toISOString().split('T')[0];
        return sessionDate === date && s.completed;
      });

      const totalMinutes = sessionsForDate.reduce((sum, session) => {
        return sum + (session.duration / 60);
      }, 0);

      return {
        date: displayDate,
        rawDate: date,
        minutes: Math.round(totalMinutes)
      };
    });
  };

  // Get habits with highest streaks
  const getTopHabits = (): Habit[] => {
    return [...habits]
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 3);
  };

  // Render data visualizations
  const habitCompletionData = generateHabitCompletionData();
  const sessionDurationData = generateSessionDurationData();
  const maxCompletionRate = Math.max(...habitCompletionData.map(d => d.completionRate), 10);
  const maxSessionMinutes = Math.max(...sessionDurationData.map(d => d.minutes), 30);

  // Calculate simplified stats
  const completionRate = calculateHabitCompletionRate();
  const totalFocusHours = calculateTotalFocusTime();
  const averageProductivity = calculateAverageProductivity();
  const upcomingEventsCount = countUpcomingEvents();
  const topHabits = getTopHabits();

  // Calculate the day with the highest productivity
  const mostProductiveDay = () => {
    const dayProductivity: { [key: string]: { total: number; count: number } } = {};

    sessions.forEach(session => {
      if (session.completed && session.feedback?.productivity) {
        const date = new Date(session.startTime);
        const day = date.getDay(); // 0 = Sunday, 6 = Saturday

        if (!dayProductivity[day]) {
          dayProductivity[day] = { total: 0, count: 0 };
        }

        dayProductivity[day].total += session.feedback.productivity;
        dayProductivity[day].count += 1;
      }
    });

    let highestAvg = 0;
    let mostProductiveDay = -1;

    Object.entries(dayProductivity).forEach(([day, data]) => {
      const avg = data.total / data.count;
      if (avg > highestAvg) {
        highestAvg = avg;
        mostProductiveDay = parseInt(day);
      }
    });

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return mostProductiveDay !== -1 ? days[mostProductiveDay] : 'Not enough data';
  };

  return (
    <div className={`${currentTheme.colors.chatMessageListBg} backdrop-blur-sm p-4 rounded-xl shadow-xl`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center">
          <ChartBarIcon className="h-6 w-6 mr-2 text-blue-400" />
          Analytics
        </h2>

        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 text-sm rounded ${timeRange === 'week'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300'
              }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 text-sm rounded ${timeRange === 'month'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300'
              }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1 text-sm rounded ${timeRange === 'year'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300'
              }`}
          >
            Year
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Habit Completion</div>
              <div className="text-2xl font-bold text-blue-400">{completionRate}%</div>
            </div>

            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Focus Time</div>
              <div className="text-2xl font-bold text-green-400">{totalFocusHours}h</div>
            </div>

            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Avg. Productivity</div>
              <div className="text-2xl font-bold text-yellow-400">{averageProductivity}/10</div>
            </div>

            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Upcoming Events</div>
              <div className="text-2xl font-bold text-purple-400">{upcomingEventsCount}</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Habit completion chart */}
            <div className="bg-slate-700/30 p-4 rounded-lg">
              <h3 className="text-md font-medium mb-4">Habit Completion Rate</h3>

              <div className="h-60 relative">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-400 pr-2">
                  {[100, 75, 50, 25, 0].map((value, index) => (
                    <div key={index} className="transform -translate-y-1/2">
                      {value}%
                    </div>
                  ))}
                </div>

                {/* Bars */}
                <div className="ml-8 h-full overflow-x-auto">
                  <div className="h-full flex items-end space-x-1">
                    {habitCompletionData.map((data, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center justify-end h-full min-w-[40px]"
                      >
                        <div
                          className="w-full bg-blue-600/70 rounded-t"
                          style={{
                            height: `${data.completionRate}%`,
                            minHeight: data.completionRate > 0 ? '4px' : '0'
                          }}
                        ></div>
                        <div className="text-xs text-slate-400 mt-1 whitespace-nowrap">
                          {timeRange === 'week' ? format(new Date(data.rawDate), 'EEE') :
                            timeRange === 'month' ? format(new Date(data.rawDate), 'dd') :
                              format(new Date(data.rawDate), 'MM/dd')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Focus session duration chart */}
            <div className="bg-slate-700/30 p-4 rounded-lg">
              <h3 className="text-md font-medium mb-4">Focus Time (minutes)</h3>

              <div className="h-60 relative">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-400 pr-2">
                  {[maxSessionMinutes, Math.round(maxSessionMinutes * 0.75), Math.round(maxSessionMinutes * 0.5), Math.round(maxSessionMinutes * 0.25), 0].map((value, index) => (
                    <div key={index} className="transform -translate-y-1/2">
                      {value}m
                    </div>
                  ))}
                </div>

                {/* Bars */}
                <div className="ml-8 h-full overflow-x-auto">
                  <div className="h-full flex items-end space-x-1">
                    {sessionDurationData.map((data, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center justify-end h-full min-w-[40px]"
                      >
                        <div
                          className="w-full bg-green-600/70 rounded-t"
                          style={{
                            height: `${(data.minutes / maxSessionMinutes) * 100}%`,
                            minHeight: data.minutes > 0 ? '4px' : '0'
                          }}
                        ></div>
                        <div className="text-xs text-slate-400 mt-1 whitespace-nowrap">
                          {timeRange === 'week' ? format(new Date(data.rawDate), 'EEE') :
                            timeRange === 'month' ? format(new Date(data.rawDate), 'dd') :
                              format(new Date(data.rawDate), 'MM/dd')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top habits */}
            <div className="bg-slate-700/30 p-4 rounded-lg">
              <h3 className="text-md font-medium mb-3">Top Performing Habits</h3>

              {topHabits.length > 0 ? (
                <div className="space-y-3">
                  {topHabits.map(habit => (
                    <div key={habit.id} className="flex items-center justify-between bg-slate-700/50 p-3 rounded">
                      <div>
                        <div className="font-medium">{habit.name}</div>
                        <div className="text-xs text-slate-400">{habit.category}</div>
                      </div>
                      <div className="flex items-center text-yellow-400">
                        <span className="font-bold mr-1">{habit.streak}</span>
                        <span className="text-xs">days</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">No habit data available yet.</p>
              )}
            </div>

            {/* Productivity insights */}
            <div className="bg-slate-700/30 p-4 rounded-lg">
              <h3 className="text-md font-medium mb-3">Productivity Insights</h3>

              <div className="space-y-4">
                <div className="bg-slate-700/50 p-3 rounded">
                  <div className="text-sm text-slate-300 mb-1">Most productive day</div>
                  <div className="font-medium text-green-400">{mostProductiveDay()}</div>
                </div>

                <div className="bg-slate-700/50 p-3 rounded">
                  <div className="text-sm text-slate-300 mb-1">Focus sessions</div>
                  <div className="font-medium text-blue-400">
                    {sessions.filter(s => s.completed).length} completed / {sessions.length} total
                  </div>
                </div>

                <div className="bg-slate-700/50 p-3 rounded">
                  <div className="text-sm text-slate-300 mb-1">Recommendation</div>
                  <div className="font-medium text-purple-400">
                    {averageProductivity < 5
                      ? "Try shorter focus sessions to improve productivity"
                      : "Your focus sessions are effective, keep up the good work!"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics; 