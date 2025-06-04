import React, { useState, useEffect } from 'react';
import { CalendarIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { format, parseISO, isToday, isTomorrow, addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  type: 'focus' | 'break' | 'meeting' | 'reminder' | 'other';
  completed?: boolean;
}

interface UpcomingEventsProps {
  compact?: boolean;
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ compact = false }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const navigate = useNavigate();
  const { currentTheme } = useTheme();

  useEffect(() => {
    const loadEvents = () => {
      const savedEvents = localStorage.getItem('focus-ritual-events');
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents);
        setEvents(parsedEvents);
      }
    };

    loadEvents();
    
    // Set up a listener for storage changes (in case calendar component updates events)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'focus-ritual-events') {
        loadEvents();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Get events for today and upcoming days
  const getUpcomingEvents = (): CalendarEvent[] => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    
    return events
      .filter(event => {
        const eventDate = parseISO(event.date);
        return eventDate >= today && eventDate <= nextWeek && !event.completed;
      })
      .sort((a, b) => {
        // Sort by date first
        const dateA = parseISO(a.date);
        const dateB = parseISO(b.date);
        
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        
        // If same date, sort by time if available
        if (a.time && b.time) {
          return a.time.localeCompare(b.time);
        }
        
        return 0;
      })
      .slice(0, compact ? 3 : 5); // Limit to 3 in compact mode, 5 otherwise
  };

  const formatEventDate = (dateStr: string): string => {
    const date = parseISO(dateStr);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else {
      return format(date, 'EEE, MMM d');
    }
  };

  const upcomingEvents = getUpcomingEvents();
  
  if (upcomingEvents.length === 0) {
    return null; // Don't render anything if no events
  }

  return (
    <div className={`${currentTheme.colors.chatMessageListBg} backdrop-blur-lg rounded-xl p-4 ${compact ? 'text-sm' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <h2 className={`${compact ? 'text-lg' : 'text-xl'} font-semibold flex items-center`}>
          <CalendarIcon className="h-5 w-5 mr-2 text-blue-400" />
          Upcoming Events
        </h2>
        <button
          onClick={() => navigate('/calendar')}
          className="text-blue-400 hover:text-blue-300 flex items-center text-sm"
        >
          View All
          <ArrowRightIcon className="h-4 w-4 ml-1" />
        </button>
      </div>
      
      <div className="space-y-2">
        {upcomingEvents.map(event => (
          <div 
            key={event.id}
            className={`p-2 rounded-lg ${currentTheme.colors.chatPromptButtonBg} hover:${currentTheme.colors.chatPromptButtonHoverBg.replace('hover:', '')} transition-colors cursor-pointer`}
            onClick={() => navigate('/calendar')}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-white">{event.title}</div>
                <div className="flex items-center text-xs text-slate-300 mt-1">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  <span>{formatEventDate(event.date)}</span>
                  
                  {event.time && (
                    <>
                      <span className="mx-1">•</span>
                      <ClockIcon className="h-3 w-3 mr-1" />
                      <span>{event.time}</span>
                    </>
                  )}
                </div>
              </div>
              
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                event.type === 'focus' ? 'bg-blue-600/50 text-blue-200' :
                event.type === 'break' ? 'bg-green-600/50 text-green-200' :
                event.type === 'meeting' ? 'bg-purple-600/50 text-purple-200' :
                event.type === 'reminder' ? 'bg-yellow-600/50 text-yellow-200' :
                'bg-slate-600/50 text-slate-200'
              }`}>
                {event.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingEvents; 