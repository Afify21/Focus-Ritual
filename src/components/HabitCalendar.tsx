import React from 'react';

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

interface HabitCalendarProps {
  habit: Habit;
  onToggleDate: (date: string) => void;
}

const HabitCalendar: React.FC<HabitCalendarProps> = ({ habit, onToggleDate }) => {
  // Get the current month's days
  const getDaysInMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    
    // Add padding days from previous month
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ 
        date: new Date(year, month, -firstDayOfWeek + i + 1), 
        isCurrentMonth: false 
      });
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ 
        date: new Date(year, month, i), 
        isCurrentMonth: true 
      });
    }
    
    // Add padding days for next month to complete the grid
    const remainingDays = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ 
        date: new Date(year, month + 1, i), 
        isCurrentMonth: false 
      });
    }
    
    return days;
  };
  
  // Format date to YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  const days = getDaysInMonth();
  const today = formatDate(new Date());
  const currentMonth = new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' });
  
  // Day of week headers
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">{currentMonth}</h3>
      
      <div className="grid grid-cols-7 gap-1">
        {weekdays.map(day => (
          <div key={day} className="text-center text-xs text-slate-400 py-1">
            {day}
          </div>
        ))}
        
        {days.map((day, index) => {
          const dateStr = formatDate(day.date);
          const isCompleted = habit.completionHistory[dateStr];
          const isToday = dateStr === today;
          
          return (
            <button
              key={index}
              onClick={() => onToggleDate(dateStr)}
              disabled={!day.isCurrentMonth || new Date(dateStr) > new Date()}
              className={`
                aspect-square p-1 text-xs rounded
                ${!day.isCurrentMonth ? 'text-slate-700 bg-transparent cursor-default' : ''}
                ${day.isCurrentMonth && !isCompleted ? 'bg-slate-800 hover:bg-slate-700' : ''}
                ${isCompleted ? 'bg-green-600/30 hover:bg-green-600/50' : ''}
                ${isToday ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>
      
      <div className="mt-2 flex justify-between items-center">
        <div className="text-sm flex space-x-4">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-600/30 rounded mr-1"></span>
            <span className="text-xs text-slate-400">Completed</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-slate-800 rounded mr-1"></span>
            <span className="text-xs text-slate-400">Not completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitCalendar; 