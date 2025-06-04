import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Analytics from '../components/Analytics';
import SessionHistory from '../components/SessionHistory';

const AnalyticsPage: React.FC = () => {
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
            <h1 className="text-xl md:text-3xl font-bold">Analytics & Insights</h1>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-6">
          <div className="text-center mb-4 text-sm sm:text-base">
            <p className="text-slate-300">
              Visualize your productivity, habits, and focus sessions with detailed analytics.
              Track your progress and gain insights to improve your focus rituals.
            </p>
          </div>
          
          <Analytics />
          
          <SessionHistory />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage; 