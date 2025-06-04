import React, { useState } from 'react';
import { ChevronRightIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';
import HabitCalendar from './HabitCalendar';
import FocusAnalytics from './FocusAnalytics';
import FocusSessionTracker from './FocusSessionTracker';
import { FocusAnalyticsService } from '../services/FocusAnalyticsService';

interface Habit {
  id: string;
  name: string;
  description?: string;
  category: string;
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

interface HabitDetailProps {
  habit: Habit;
  onClose: () => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onToggleDate: (habitId: string, date: string) => void;
}

const HabitDetail: React.FC<HabitDetailProps> = ({
  habit,
  onClose,
  onEdit,
  onDelete,
  onToggleDate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedHabit, setEditedHabit] = useState({ ...habit });

  const getCategoryDetails = (categoryId: string) => {
    return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
  };

  const category = getCategoryDetails(habit.category);

  const handleSaveEdit = () => {
    onEdit(editedHabit);
    setIsEditing(false);
  };

  const calculateCompletionRate = () => {
    const dates = Object.keys(habit.completionHistory);
    if (dates.length === 0) return 0;

    const completedCount = dates.filter(date => habit.completionHistory[date]).length;
    return Math.round((completedCount / dates.length) * 100);
  };

  const handleToggleDate = (date: string) => {
    onToggleDate(habit.id, date);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-white">{habit.name}</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {habit.description && (
            <p className="text-slate-300 mb-6">{habit.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-700/50 p-3 rounded-lg text-center">
              <div className="text-xs text-slate-400 mb-1">Current Streak</div>
              <div className="text-2xl font-bold text-yellow-400">{habit.streak} days</div>
            </div>

            <div className="bg-slate-700/50 p-3 rounded-lg text-center">
              <div className="text-xs text-slate-400 mb-1">Completion Rate</div>
              <div className="text-2xl font-bold text-green-400">{calculateCompletionRate()}%</div>
            </div>

            <div className="bg-slate-700/50 p-3 rounded-lg text-center">
              <div className="text-xs text-slate-400 mb-1">Tracked Since</div>
              <div className="text-2xl font-bold text-blue-400">
                {new Date(habit.createdAt).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Focus Session Tracker */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Focus Session</h3>
            <FocusSessionTracker
              habit={habit}
              onSessionComplete={() => {
                // Refresh analytics after session completion
                const analyticsService = FocusAnalyticsService.getInstance();
                analyticsService.loadFocusData();
              }}
            />
          </div>

          {/* Focus Analytics Section */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Focus Analytics</h3>
            <FocusAnalytics habit={habit} />
          </div>

          <HabitCalendar
            habit={habit}
            onToggleDate={handleToggleDate}
          />

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => onDelete(habit.id)}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Delete Habit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitDetail; 