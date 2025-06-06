import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Habit } from '../types/habit';
import { FocusSession } from '../types/session';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load data
    const loadData = async () => {
      try {
        // Load habits and sessions from localStorage or API
        const storedHabits = localStorage.getItem('habits');
        const storedSessions = localStorage.getItem('focus-sessions');
        
        const loadedHabits = storedHabits ? JSON.parse(storedHabits) : [];
        const loadedSessions = storedSessions ? JSON.parse(storedSessions) : [];
        
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

  // Get dates for the selected time range
  const getDates = (): string[] => {
    const dates: string[] = [];
    const today = new Date();
    let daysToShow = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
  };

  // Generate habit completion data for chart
  const generateHabitCompletionData = () => {
    const dates = getDates();

    return dates.map(date => {
      const displayDate = format(new Date(date), 'MM/dd');
      const habitsForDate = habits.filter(habit => habit.completionHistory[date]);
      const completionRate = (habitsForDate.length / habits.length) * 100;

      return {
        date: displayDate,
        rawDate: date,
        completionRate: Math.round(completionRate) || 0
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
  const topHabits = getTopHabits();

  return (
    <div className="space-y-8">
      {/* Time range selector */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setTimeRange('week')}
          className={`px-3 py-1 rounded ${
            timeRange === 'week'
              ? 'bg-blue-500 text-white'
              : 'bg-slate-700/50 text-slate-300'
          }`}
        >
          Week
        </button>
        <button
          onClick={() => setTimeRange('month')}
          className={`px-3 py-1 rounded ${
            timeRange === 'month'
              ? 'bg-blue-500 text-white'
              : 'bg-slate-700/50 text-slate-300'
          }`}
        >
          Month
        </button>
        <button
          onClick={() => setTimeRange('year')}
          className={`px-3 py-1 rounded ${
            timeRange === 'year'
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
        <div className="bg-slate-700/30 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Habit Completion Rate</h3>
          <div className="relative h-64">
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-slate-400">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
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
                        height: `${(data.completionRate / maxCompletionRate) * 100}%`,
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

        {/* Focus Time Chart */}
        <div className="bg-slate-700/30 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Focus Time (minutes)</h3>
          <div className="relative h-64">
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-slate-400">
              <span>{maxSessionMinutes}m</span>
              <span>{Math.round(maxSessionMinutes * 0.75)}m</span>
              <span>{Math.round(maxSessionMinutes * 0.5)}m</span>
              <span>{Math.round(maxSessionMinutes * 0.25)}m</span>
              <span>0m</span>
            </div>
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

      {/* Top Performing Habits */}
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

      {/* AI Insights */}
      {aiInsights && (
        <div className="bg-slate-700/30 p-4 rounded-lg">
          <h3 className="text-md font-medium mb-3">Your AI Insights</h3>
          <div className="space-y-3">
            <div className="bg-slate-700/50 p-3 rounded">
              <p className="text-slate-300">{aiInsights}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics; 