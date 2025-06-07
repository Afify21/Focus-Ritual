import React, { useState, useEffect } from 'react';
import { CheckIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

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

      {habits.length === 0 ? (
        <div className="text-center py-4 text-slate-400">
          <p>No habits tracked yet</p>
          <button
            onClick={() => navigate('/habits')}
            className="mt-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
          >
            Get Started
          </button>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Today's progress</span>
              <span>{todayCompletionCount} / {habits.length} completed</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>

          {/* Habit list */}
          <div className="space-y-2">
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
        </>
      )}
    </div>
  );
};

export default HabitSummary; 