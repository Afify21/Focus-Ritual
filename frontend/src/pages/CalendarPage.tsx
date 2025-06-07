import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import EventCalendar from '../components/EventCalendar';

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();

  return (
    <div className={`min-h-screen text-white p-1 sm:p-3 md:p-4 ${currentTheme.colors.chatWindowBg} overflow-x-hidden`}>
      <div className="w-full max-w-5xl mx-auto">
        {/* Header with back button */}
        <div className="flex justify-between items-center mb-3 md:mb-6">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')}
              className={`mr-3 p-2 rounded-full ${currentTheme.colors.chatPromptButtonBg} ${currentTheme.colors.chatPromptButtonHoverBg} transition-colors`}
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-xl md:text-3xl font-bold">Calendar & Events</h1>
          </div>
        </div>

        {/* Main content */}
        <div className={`${currentTheme.colors.chatMessageListBg} backdrop-blur-sm p-3 sm:p-4 md:p-6 rounded-xl shadow-xl overflow-hidden`}>
          <div className="text-center mb-4 text-sm sm:text-base">
            <p className="text-slate-300">
              Plan your focus sessions, breaks, and meetings with the calendar. 
              Keep track of upcoming events and never miss an important date.
            </p>
          </div>
          
          <EventCalendar />
        </div>
      </div>
    </div>
  );
};

export default CalendarPage; 