import React, { useState } from 'react';
import { ChevronRightIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import HabitCalendar from './HabitCalendar';

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
    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="flex justify-between items-center p-4 bg-slate-700">
        <div className="flex items-center">
          <div className={`w-4 h-4 rounded-full ${category.color} mr-3`}></div>
          <h3 className="text-xl font-medium">{habit.name}</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-full hover:bg-slate-600 text-slate-300 hover:text-white"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(habit.id)}
            className="p-2 rounded-full hover:bg-slate-600 text-slate-300 hover:text-white"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-600 text-slate-300 hover:text-white"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Name</label>
              <input
                type="text"
                value={editedHabit.name}
                onChange={(e) => setEditedHabit({...editedHabit, name: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-300 mb-1">Description</label>
              <textarea
                value={editedHabit.description || ''}
                onChange={(e) => setEditedHabit({...editedHabit, description: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-300 mb-1">Category</label>
              <select
                value={editedHabit.category}
                onChange={(e) => setEditedHabit({...editedHabit, category: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                {CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-slate-300 mb-1">Frequency</label>
              <select
                value={editedHabit.frequency.type}
                onChange={(e) => setEditedHabit({
                  ...editedHabit, 
                  frequency: {
                    ...editedHabit.frequency, 
                    type: e.target.value as 'daily' | 'weekly' | 'custom'
                  }
                })}
                className="w-full px-3 py-2 bg-slate-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div>
            {habit.description && (
              <p className="text-slate-300 mb-4">{habit.description}</p>
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
            
            <HabitCalendar 
              habit={habit}
              onToggleDate={handleToggleDate}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitDetail; 