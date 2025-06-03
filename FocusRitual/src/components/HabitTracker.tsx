import React, { useState, useEffect } from 'react';
import { CheckIcon, PlusIcon, TrashIcon, SparklesIcon, CalendarIcon, FolderIcon, TagIcon, TrophyIcon, BellIcon } from '@heroicons/react/24/solid';
import NotificationSettings from './NotificationSettings';
import { HabitReminderService } from '../services/HabitReminderService';

interface Habit {
  id: string;
  name: string;
  description?: string;
  category: string;
  frequency: {
    type: 'daily' | 'weekly' | 'custom';
    days?: number[]; // [0,1,2,3,4,5,6] for specific days of week
    time?: string;
  };
  completionHistory: {
    [date: string]: boolean;
  };
  streak: number;
  color?: string;
  createdAt: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  threshold?: number;
  date?: string;
}

// Predefined categories with colors
const CATEGORIES = [
  { id: 'health', name: 'Health', color: 'bg-green-500' },
  { id: 'learning', name: 'Learning', color: 'bg-blue-500' },
  { id: 'work', name: 'Work', color: 'bg-purple-500' },
  { id: 'personal', name: 'Personal', color: 'bg-yellow-500' },
  { id: 'social', name: 'Social', color: 'bg-pink-500' },
  { id: 'other', name: 'Other', color: 'bg-gray-500' }
];

interface HabitTrackerProps {
  compact?: boolean;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ compact = false }) => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const savedHabits = localStorage.getItem('focus-ritual-habits');
    const parsedHabits = savedHabits ? JSON.parse(savedHabits) : [];
    
    // Handle migration of existing habits - ensure backward compatibility
    return parsedHabits.map((habit: any) => ({
      ...habit,
      category: habit.category || 'other',
      frequency: {
        ...habit.frequency,
        // Ensure frequency has proper structure with defaults
        type: habit.frequency?.type || 'daily',
        days: habit.frequency?.days || [],
        time: habit.frequency?.time || ''
      }
    }));
  });
  
  const [showForm, setShowForm] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    category: 'other',
    frequency: { 
      type: 'daily' as 'daily' | 'weekly' | 'custom', 
      days: [] as number[],
      time: ''
    }
  });
  const [aiRecommendation, setAiRecommendation] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [userGoals, setUserGoals] = useState<string>(() => {
    return localStorage.getItem('focus-ritual-habit-goals') || '';
  });
  const [showGoalsInput, setShowGoalsInput] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const savedAchievements = localStorage.getItem('focus-ritual-achievements');
    return savedAchievements ? JSON.parse(savedAchievements) : [
      {
        id: 'first-habit',
        title: 'Getting Started',
        description: 'Create your first habit',
        icon: '🌱',
        unlocked: false
      },
      {
        id: 'three-day-streak',
        title: 'Building Momentum',
        description: 'Maintain a 3-day streak on any habit',
        icon: '🔥',
        unlocked: false,
        progress: 0,
        threshold: 3
      },
      {
        id: 'seven-day-streak',
        title: 'Consistency Champion',
        description: 'Maintain a 7-day streak on any habit',
        icon: '🏆',
        unlocked: false,
        progress: 0,
        threshold: 7
      },
      {
        id: 'five-habits',
        title: 'Habit Collector',
        description: 'Track 5 different habits',
        icon: '🌟',
        unlocked: false,
        progress: 0,
        threshold: 5
      },
      {
        id: 'perfect-week',
        title: 'Perfect Week',
        description: 'Complete all habits for 7 days straight',
        icon: '🎯',
        unlocked: false,
        progress: 0,
        threshold: 7
      }
    ];
  });
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  useEffect(() => {
    localStorage.setItem('focus-ritual-habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('focus-ritual-habit-goals', userGoals);
  }, [userGoals]);

  useEffect(() => {
    localStorage.setItem('focus-ritual-achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    // Check for achievements whenever habits change
    checkAchievements();
  }, [habits]);

  useEffect(() => {
    // Start the habit reminder checks
    const stopReminders = HabitReminderService.startReminderChecks(() => habits);
    
    // Clean up on unmount
    return () => {
      stopReminders();
    };
  }, []); // Empty dependency array means this runs once on mount

  const formatDate = (date: Date = new Date()): string => {
    return date.toISOString().split('T')[0];
  };

  const toggleHabitCompletion = (habitId: string) => {
    const today = formatDate();
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const wasCompleted = habit.completionHistory[today];
        const newCompletionHistory = {
          ...habit.completionHistory,
          [today]: !wasCompleted
        };
        
        // Fixed streak calculation - only count unique consecutive days
        let streak = 0;
        const currentDate = new Date();
        let consecutiveDays = true;
        
        // Start from today and go backwards
        for (let i = 0; consecutiveDays && i < 100; i++) { // Check up to 100 days back
          const checkDate = new Date();
          checkDate.setDate(currentDate.getDate() - i);
          const dateStr = formatDate(checkDate);
          
          // For today, use the new completion status
          const isCompleted = i === 0 ? newCompletionHistory[dateStr] : habit.completionHistory[dateStr];
          
          if (isCompleted) {
            streak++;
          } else {
            // Break the streak when we find a day that wasn't completed
            consecutiveDays = false;
          }
        }
        
        return {
          ...habit,
          completionHistory: newCompletionHistory,
          streak: streak
        };
      }
      return habit;
    }));
  };

  const addHabit = () => {
    if (newHabit.name.trim() === '') return;
    
    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name.trim(),
      description: newHabit.description,
      category: newHabit.category,
      frequency: newHabit.frequency,
      completionHistory: {},
      streak: 0,
      createdAt: new Date().toISOString()
    };
    
    setHabits([...habits, habit]);
    setNewHabit({
      name: '',
      description: '',
      category: 'other',
      frequency: { type: 'daily', days: [], time: '' }
    });
    setShowForm(false);
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(habit => habit.id !== id));
  };

  const fetchAiRecommendation = async () => {
    setIsLoadingAi(true);
    try {
      // For development/demo purposes, we'll use the backend if available,
      // but fall back to simulated responses if it fails
      try {
        const response = await fetch('/api/habits/recommendation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            habits, 
            goals: userGoals 
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAiRecommendation(data.recommendation);
            return;
          }
        }
        throw new Error('API request failed');
      } catch (apiError) {
        console.log('API error, using fallback recommendations:', apiError);
        // Fallback to simulated recommendations if the API fails
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
        
        const recommendations = [
          "Based on your habit patterns, consider adding a '5-minute morning meditation' habit to start your day focused.",
          "I notice you're building reading habits. Try adding a 'Summarize what I read' habit to improve retention.",
          "You might benefit from a 'Drink water before meals' habit to improve your daily hydration.",
          "Adding a 'Review tomorrow's tasks' evening habit could help you better prepare for each day.",
          "Consider a 'Take a short walk' habit after long focus sessions to refresh your mind."
        ];
        
        setAiRecommendation(recommendations[Math.floor(Math.random() * recommendations.length)]);
      }
    } catch (error) {
      console.error('Error getting AI recommendation:', error);
      setAiRecommendation('Unable to generate recommendation at this time.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Filter habits by selected category
  const filteredHabits = selectedCategory 
    ? habits.filter(habit => habit.category === selectedCategory) 
    : habits;

  const getCategoryDetails = (categoryId: string) => {
    return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
  };

  // Check for achievement unlocks
  const checkAchievements = () => {
    let updatedAchievements = [...achievements];
    let newAchievementUnlocked = false;
    let latestAchievement: Achievement | null = null;
    
    // First habit achievement
    const firstHabitAchievement = updatedAchievements.find(a => a.id === 'first-habit');
    if (firstHabitAchievement && !firstHabitAchievement.unlocked && habits.length > 0) {
      firstHabitAchievement.unlocked = true;
      firstHabitAchievement.date = new Date().toISOString();
      newAchievementUnlocked = true;
      latestAchievement = firstHabitAchievement;
    }

    // Five habits achievement
    const fiveHabitsAchievement = updatedAchievements.find(a => a.id === 'five-habits');
    if (fiveHabitsAchievement) {
      const habitCount = habits.length;
      fiveHabitsAchievement.progress = habitCount;
      
      if (!fiveHabitsAchievement.unlocked && habitCount >= 5) {
        fiveHabitsAchievement.unlocked = true;
        fiveHabitsAchievement.date = new Date().toISOString();
        newAchievementUnlocked = true;
        latestAchievement = fiveHabitsAchievement;
      }
    }

    // Streak achievements
    const maxStreak = Math.max(...habits.map(h => h.streak));
    
    // 3-day streak
    const threeDayStreakAchievement = updatedAchievements.find(a => a.id === 'three-day-streak');
    if (threeDayStreakAchievement) {
      threeDayStreakAchievement.progress = maxStreak;
      
      if (!threeDayStreakAchievement.unlocked && maxStreak >= 3) {
        threeDayStreakAchievement.unlocked = true;
        threeDayStreakAchievement.date = new Date().toISOString();
        newAchievementUnlocked = true;
        latestAchievement = threeDayStreakAchievement;
      }
    }

    // 7-day streak
    const sevenDayStreakAchievement = updatedAchievements.find(a => a.id === 'seven-day-streak');
    if (sevenDayStreakAchievement) {
      sevenDayStreakAchievement.progress = maxStreak;
      
      if (!sevenDayStreakAchievement.unlocked && maxStreak >= 7) {
        sevenDayStreakAchievement.unlocked = true;
        sevenDayStreakAchievement.date = new Date().toISOString();
        newAchievementUnlocked = true;
        latestAchievement = sevenDayStreakAchievement;
      }
    }

    // Perfect week
    const perfectWeekAchievement = updatedAchievements.find(a => a.id === 'perfect-week');
    if (perfectWeekAchievement && habits.length > 0) {
      // Check the last 7 days for perfect completion
      let perfectDays = 0;
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = formatDate(checkDate);
        
        const allCompleted = habits.every(habit => habit.completionHistory[dateStr]);
        if (allCompleted) perfectDays++;
      }
      
      perfectWeekAchievement.progress = perfectDays;
      
      if (!perfectWeekAchievement.unlocked && perfectDays >= 7) {
        perfectWeekAchievement.unlocked = true;
        perfectWeekAchievement.date = new Date().toISOString();
        newAchievementUnlocked = true;
        latestAchievement = perfectWeekAchievement;
      }
    }

    // Update achievements and show notification if new one unlocked
    if (newAchievementUnlocked) {
      setAchievements(updatedAchievements);
      setRecentAchievement(latestAchievement);
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setRecentAchievement(null);
      }, 5000);
    }
  };

  return (
    <div className={`w-full ${compact ? 'scale-90 origin-top' : ''}`}>
      {/* Header with button */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">My Habits</h2>
          {!compact && (
            <div className="flex">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1 text-sm rounded-full mr-2 ${
                  selectedCategory === null
                    ? 'bg-slate-100 text-slate-800'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                All
              </button>
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1 text-sm rounded-full mr-2 ${
                    selectedCategory === category.id
                      ? `${category.color.replace('bg-', 'bg-')} text-white`
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowNotificationSettings(!showNotificationSettings)}
            className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white"
            title="Notification Settings"
          >
            <BellIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => setShowAchievements(true)}
            className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white"
            title="Achievements"
          >
            <TrophyIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={fetchAiRecommendation}
            className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white"
            title="Get AI Suggestion"
          >
            <SparklesIcon className="h-5 w-5 text-yellow-400" />
          </button>
          
          <button
            onClick={() => setShowForm(true)}
            className="p-2 rounded-full bg-green-600 hover:bg-green-500 text-white"
            title="Add New Habit"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {showNotificationSettings && (
        <div className="mb-4">
          <NotificationSettings />
        </div>
      )}

      {/* Achievement unlocked notification */}
      {recentAchievement && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/40 rounded-lg animate-pulse">
          <div className="flex items-center">
            <div className="text-xl mr-2">{recentAchievement.icon}</div>
            <div>
              <div className="font-medium text-yellow-300">Achievement Unlocked!</div>
              <div className="text-sm text-white">{recentAchievement.title}: {recentAchievement.description}</div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Panel */}
      {showAchievements && (
        <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium flex items-center">
              <TrophyIcon className="h-4 w-4 mr-1 text-yellow-400" />
              Your Achievements
            </h4>
            <button 
              onClick={() => setShowAchievements(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {achievements.map(achievement => (
              <div 
                key={achievement.id}
                className={`p-2 rounded border ${
                  achievement.unlocked 
                    ? 'bg-slate-600/70 border-yellow-500/50 text-white' 
                    : 'bg-slate-700/30 border-slate-600 text-slate-400'
                }`}
              >
                <div className="flex items-center">
                  <div className="text-2xl mr-3 flex-shrink-0">{achievement.icon}</div>
                  <div>
                    <div className={`font-medium ${achievement.unlocked ? 'text-yellow-300' : 'text-slate-300'}`}>
                      {achievement.title}
                    </div>
                    <div className="text-xs">{achievement.description}</div>
                    {achievement.threshold && (
                      <div className="mt-1 h-1 bg-slate-700 rounded-full">
                        <div 
                          className="h-full bg-yellow-500 rounded-full" 
                          style={{ width: `${Math.min(100, (achievement.progress || 0) / achievement.threshold * 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goals Input */}
      {showGoalsInput ? (
        <div className="mb-4">
          <textarea
            value={userGoals}
            onChange={(e) => setUserGoals(e.target.value)}
            placeholder="What are your goals? (e.g. learn Spanish, exercise more, reduce screen time)"
            className="w-full px-3 py-2 bg-slate-700 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 text-sm"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={() => setShowGoalsInput(false)}
              className="text-xs text-slate-300 hover:text-white px-2 py-1"
            >
              Save Goals
            </button>
          </div>
        </div>
      ) : userGoals ? (
        <div className="mb-4 p-2 bg-slate-700/30 rounded-lg text-xs text-slate-300 flex justify-between items-center">
          <div>
            <span className="font-medium">Your goals:</span> {userGoals}
          </div>
          <button
            onClick={() => setShowGoalsInput(true)}
            className="text-slate-400 hover:text-white ml-2 flex-shrink-0"
          >
            Edit
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowGoalsInput(true)}
          className="mb-4 text-xs text-slate-400 hover:text-slate-300"
        >
          + Set your goals to get better AI recommendations
        </button>
      )}

      {/* AI Recommendation */}
      {(isLoadingAi || aiRecommendation) && (
        <div className="mb-4 p-3 bg-slate-700/60 rounded-lg border border-yellow-500/30">
          <div className="flex">
            <SparklesIcon className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              {isLoadingAi ? (
                <div className="text-sm text-slate-300">Generating recommendation...</div>
              ) : (
                <div className="text-sm text-slate-300">{aiRecommendation}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Habit Form */}
      {showForm && (
        <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Habit name"
              value={newHabit.name}
              onChange={e => setNewHabit({...newHabit, name: e.target.value})}
              className="w-full px-3 py-2 bg-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
          <div className="mb-3">
            <textarea
              placeholder="Description (optional)"
              value={newHabit.description}
              onChange={e => setNewHabit({...newHabit, description: e.target.value})}
              className="w-full px-3 py-2 bg-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              rows={2}
            />
          </div>
          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Category</label>
              <select
                value={newHabit.category}
                onChange={e => setNewHabit({...newHabit, category: e.target.value})}
                className="w-full px-3 py-2 bg-slate-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                {CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Frequency</label>
              <select
                value={newHabit.frequency.type}
                onChange={e => setNewHabit({
                  ...newHabit, 
                  frequency: {
                    ...newHabit.frequency, 
                    type: e.target.value as 'daily' | 'weekly' | 'custom',
                    // Reset days when changing frequency type
                    days: e.target.value === 'custom' ? [] : newHabit.frequency.days
                  }
                })}
                className="w-full px-3 py-2 bg-slate-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
          
          {/* Advanced scheduling options */}
          {newHabit.frequency.type === 'weekly' && (
            <div className="mb-3">
              <label className="block text-sm text-slate-300 mb-2">Select Days</label>
              <div className="flex flex-wrap gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      const days = newHabit.frequency.days.includes(index)
                        ? newHabit.frequency.days.filter(d => d !== index)
                        : [...newHabit.frequency.days, index];
                      
                      setNewHabit({
                        ...newHabit,
                        frequency: {
                          ...newHabit.frequency,
                          days
                        }
                      });
                    }}
                    className={`px-3 py-1 text-sm rounded-full ${
                      newHabit.frequency.days.includes(index)
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-600 text-slate-300'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {newHabit.frequency.type === 'custom' && (
            <div className="mb-3">
              <label className="block text-sm text-slate-300 mb-2">Select Days</label>
              <div className="flex flex-wrap gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      const days = newHabit.frequency.days.includes(index)
                        ? newHabit.frequency.days.filter(d => d !== index)
                        : [...newHabit.frequency.days, index];
                      
                      setNewHabit({
                        ...newHabit,
                        frequency: {
                          ...newHabit.frequency,
                          days
                        }
                      });
                    }}
                    className={`px-3 py-1 text-sm rounded-full ${
                      newHabit.frequency.days.includes(index)
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-600 text-slate-300'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-3">
            <label className="block text-sm text-slate-300 mb-1">Reminder Time (Optional)</label>
            <input
              type="time"
              value={newHabit.frequency.time}
              onChange={e => setNewHabit({
                ...newHabit,
                frequency: {
                  ...newHabit.frequency,
                  time: e.target.value
                }
              })}
              className="w-full px-3 py-2 bg-slate-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-white"
            >
              Cancel
            </button>
            <button
              onClick={addHabit}
              className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-white disabled:opacity-50"
              disabled={newHabit.name.trim() === '' || 
                (newHabit.frequency.type !== 'daily' && newHabit.frequency.days.length === 0)}
            >
              Save Habit
            </button>
          </div>
        </div>
      )}

      {/* Habits List */}
      <div className={`space-y-2 ${compact ? 'max-h-[180px]' : 'max-h-[300px]'} overflow-y-auto pr-1`}>
        {filteredHabits.length === 0 ? (
          <p className="text-slate-400 text-center py-4 italic">
            {habits.length === 0 ? 
              "No habits tracked yet. Add one to get started!" :
              "No habits in this category. Add one or select a different category."
            }
          </p>
        ) : (
          filteredHabits.map(habit => {
            const today = formatDate();
            const isCompletedToday = habit.completionHistory[today];
            const category = getCategoryDetails(habit.category);
            
            return (
              <div 
                key={habit.id}
                className={`p-3 rounded-lg ${
                  isCompletedToday ? 'bg-slate-700/50 border-l-4 border-green-500' : 'bg-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center flex-1">
                    <button
                      onClick={() => toggleHabitCompletion(habit.id)}
                      className={`h-5 w-5 rounded mr-3 flex items-center justify-center ${
                        isCompletedToday ? 'bg-green-600' : 'border border-slate-400'
                      }`}
                    >
                      {isCompletedToday && <CheckIcon className="h-3 w-3 text-white" />}
                    </button>
                    <div className="flex-1">
                      <div className="text-white font-medium flex items-center">
                        <span>{habit.name}</span>
                        <span className={`ml-2 w-2 h-2 rounded-full ${category.color}`} title={category.name}></span>
                      </div>
                      {habit.description && (
                        <div className="text-xs text-slate-400">{habit.description}</div>
                      )}
                      {habit.frequency.time && (
                        <div className="text-xs text-blue-400 flex items-center mt-1">
                          <BellIcon className="h-3 w-3 mr-1" />
                          <span>Reminder at {habit.frequency.time}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center ml-2">
                    {habit.streak > 0 && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded mr-2">
                        {habit.streak} day{habit.streak !== 1 ? 's' : ''}
                      </span>
                    )}
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HabitTracker; 