import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './CalendarPage.css';

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

                    {/* Custom static calendar UI */}
                    <div className="habit-calendar">
                        <div className="calendar-header">
                            <div className="calendar-title">June 2025</div>
                            <div className="calendar-nav">
                                <button className="calendar-nav-btn" title="Previous month">
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                <button className="calendar-nav-btn" title="Next month">
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                        <div className="calendar-grid">
                            <div className="calendar-day">
                                <div className="day-name">Sun</div>
                                <div className="day-number">1</div>
                            </div>
                            <div className="calendar-day">
                                <div className="day-name">Mon</div>
                                <div className="day-number completed">2</div>
                            </div>
                            <div className="calendar-day">
                                <div className="day-name">Tue</div>
                                <div className="day-number completed">3</div>
                            </div>
                            <div className="calendar-day">
                                <div className="day-name">Wed</div>
                                <div className="day-number completed">4</div>
                            </div>
                            <div className="calendar-day">
                                <div className="day-name">Thu</div>
                                <div className="day-number completed">5</div>
                            </div>
                            <div className="calendar-day">
                                <div className="day-name">Fri</div>
                                <div className="day-number current">6</div>
                            </div>
                            <div className="calendar-day">
                                <div className="day-name">Sat</div>
                                <div className="day-number">7</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage; 