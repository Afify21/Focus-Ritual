import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import './HabitCalendarView.css';

interface HabitCalendarViewProps {
    habits: Array<{
        id: string;
        name: string;
        completionHistory: string[];
    }>;
    onToggleDate: (date: Date) => void;
}

const HabitCalendarView: React.FC<HabitCalendarViewProps> = ({ habits, onToggleDate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = () => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        const days = eachDayOfInterval({ start, end });

        // Add padding days to start from Sunday
        const firstDay = start.getDay();
        const paddingStart = Array(firstDay).fill(null);

        return [...paddingStart, ...days];
    };

    const formatDate = (date: Date) => {
        return format(date, 'yyyy-MM-dd');
    };

    const isDateCompleted = (date: Date) => {
        const dateStr = formatDate(date);
        return habits.some(habit => habit.completionHistory.includes(dateStr));
    };

    const getDayName = (date: Date | null) => {
        if (!date) return '';
        return format(date, 'EEE');
    };

    return (
        <div className="habit-calendar">
            <div className="calendar-header">
                <div className="calendar-title">
                    {format(currentDate, 'MMMM yyyy')}
                </div>
                <div className="calendar-nav">
                    <button
                        onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                        className="calendar-nav-btn"
                        title="Previous month"
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <button
                        onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                        className="calendar-nav-btn"
                        title="Next month"
                    >
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            <div className="calendar-grid">
                {getDaysInMonth().map((date, index) => (
                    <div
                        key={index}
                        className="calendar-day"
                        onClick={() => date && onToggleDate(date)}
                    >
                        <div className="day-name">{getDayName(date)}</div>
                        <div className={`day-number ${date ? (
                                isToday(date) ? 'current' :
                                    isDateCompleted(date) ? 'completed' : ''
                            ) : ''
                            }`}>
                            {date ? format(date, 'd') : ''}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HabitCalendarView; 