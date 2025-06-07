import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { PlusIcon, TrashIcon, CalendarIcon, ClockIcon, XMarkIcon, EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../context/ThemeContext';

// Define the event interface
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO string
  time?: string; // HH:MM format
  type: 'focus' | 'break' | 'meeting' | 'reminder' | 'other';
  completed?: boolean;
}

interface EventCalendarProps {
  compact?: boolean;
}

const EventCalendar: React.FC<EventCalendarProps> = ({ compact = false }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const savedEvents = localStorage.getItem('focus-ritual-events');
    return savedEvents ? JSON.parse(savedEvents) : [];
  });
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, 'id'>>({
    title: '',
    description: '',
    date: format(date, 'yyyy-MM-dd'),
    time: '',
    type: 'focus'
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventOptions, setShowEventOptions] = useState<string | null>(null);
  const { currentTheme } = useTheme();

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('focus-ritual-events', JSON.stringify(events));
  }, [events]);

  // Get events for the selected date
  const getEventsForDate = (date: Date | null): CalendarEvent[] => {
    if (!date) return [];
    const dateString = format(date, 'yyyy-MM-dd');
    return events.filter(event => event.date.startsWith(dateString));
  };

  // Get count of events for a specific date
  const getEventCountForDate = (date: Date): number => {
    const dateString = format(date, 'yyyy-MM-dd');
    return events.filter(event => event.date.startsWith(dateString)).length;
  };

  // Add a new event
  const handleAddEvent = () => {
    if (!newEvent.title.trim()) return;

    const event: CalendarEvent = {
      ...newEvent,
      id: Date.now().toString(),
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : newEvent.date
    };

    setEvents([...events, event]);
    setShowAddEvent(false);
    setNewEvent({
      title: '',
      description: '',
      date: format(date, 'yyyy-MM-dd'),
      time: '',
      type: 'focus'
    });
  };

  // Delete an event
  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
    setShowEventOptions(null);
  };

  // Mark event as completed
  const toggleEventCompletion = (id: string) => {
    setEvents(events.map(event => 
      event.id === id ? { ...event, completed: !event.completed } : event
    ));
  };

  // Duplicate an event
  const duplicateEvent = (id: string) => {
    const eventToCopy = events.find(event => event.id === id);
    if (eventToCopy) {
      const newEvent = {
        ...eventToCopy,
        id: Date.now().toString(),
        title: `${eventToCopy.title} (Copy)`
      };
      setEvents([...events, newEvent]);
      setShowEventOptions(null);
    }
  };

  // Enhanced tile content with better event indicators
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    
    const eventCount = getEventCountForDate(date);
    if (eventCount > 0) {
      // Get events for the date to show different colors
      const dateEvents = getEventsForDate(date);
      const hasCompletedEvents = dateEvents.some(event => event.completed);
      const hasFocusEvents = dateEvents.some(event => event.type === 'focus');
      const hasMeetingEvents = dateEvents.some(event => event.type === 'meeting');
      
      return (
        <div className="absolute bottom-1 left-0 right-0 flex justify-center">
          <div className="flex space-x-1">
            {hasFocusEvents && (
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
            )}
            {hasMeetingEvents && (
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
            )}
            {hasCompletedEvents && (
              <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
            )}
            {eventCount > 0 && !hasFocusEvents && !hasMeetingEvents && !hasCompletedEvents && (
              <div className="h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Add calendar styles dynamically with better responsive sizes
  useEffect(() => {
    // Create a style element
    const styleEl = document.createElement('style');
    
    // Set the CSS content with responsive styles
    styleEl.textContent = `
      .react-calendar {
        background-color: ${currentTheme.id === 'default' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(30, 41, 59, 0.5)'};
        border-radius: 0.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
        font-family: inherit;
        width: 100% !important;
        max-width: 100%;
        font-size: 0.875rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      .react-calendar button {
        padding: 0.25rem;
        transition: all 0.15s ease;
      }
      .react-calendar__tile {
        position: relative;
        color: rgba(255, 255, 255, 0.8);
        padding: 0.5em 0.25em;
        max-width: 100%;
        text-align: center;
        line-height: 16px;
        border-radius: 0.25rem;
        margin: 1px;
      }
      .react-calendar__tile abbr {
        font-size: 0.75rem;
        font-weight: 500;
      }
      @media (min-width: 640px) {
        .react-calendar__tile abbr {
          font-size: 0.875rem;
        }
        .react-calendar__tile {
          padding: 0.75em 0.5em;
        }
      }
      .react-calendar__tile:enabled:hover,
      .react-calendar__tile:enabled:focus {
        background-color: rgba(59, 130, 246, 0.3);
        transform: scale(1.05);
      }
      .react-calendar__tile--now {
        background-color: rgba(59, 130, 246, 0.2);
        border: 1px solid rgba(59, 130, 246, 0.4);
      }
      .react-calendar__tile--active {
        background-color: rgba(59, 130, 246, 0.6);
      }
      .react-calendar__navigation button:enabled:hover,
      .react-calendar__navigation button:enabled:focus {
        background-color: rgba(59, 130, 246, 0.2);
      }
      .react-calendar__month-view__weekdays__weekday {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.75rem;
        padding: 0.25rem;
        text-transform: uppercase;
        font-weight: 600;
      }
      .react-calendar__navigation {
        margin-bottom: 0.5em;
        height: auto;
      }
      .react-calendar__month-view__days__day--weekend {
        color: rgba(248, 113, 113, 0.9);
      }
      .react-calendar__tile--hasActive {
        background-color: rgba(59, 130, 246, 0.5);
      }
      .react-calendar__navigation button {
        border-radius: 0.25rem;
        font-weight: 500;
      }
    `;
    
    // Append to head
    document.head.appendChild(styleEl);
    
    // Cleanup when component unmounts
    return () => {
      document.head.removeChild(styleEl);
    };
  }, [currentTheme.id]);

  return (
    <div className={`w-full ${compact ? 'scale-90 origin-top' : ''}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold">Calendar</h2>
        <button
          onClick={() => {
            setSelectedDate(date);
            setShowAddEvent(true);
            setNewEvent({
              ...newEvent,
              date: format(date, 'yyyy-MM-dd')
            });
          }}
          className={`p-1.5 rounded-full ${currentTheme.colors.chatSendButtonBg} ${currentTheme.colors.chatSendButtonHoverBg}`}
          title="Add Event"
        >
          <PlusIcon className="h-4 w-4 text-white" />
        </button>
      </div>

      <div className={`${currentTheme.colors.chatMessageListBg} p-2 sm:p-3 rounded-lg shadow-md mb-3 backdrop-blur-sm`}>
        <div className="relative w-full max-w-full overflow-hidden">
          <Calendar 
            onChange={(value: any) => {
              if (value instanceof Date) {
                setDate(value);
                setSelectedDate(value);
                
                // Auto-update the new event date when selecting a date
                if (showAddEvent) {
                  setNewEvent({
                    ...newEvent,
                    date: format(value, 'yyyy-MM-dd')
                  });
                }
              }
            }}
            value={date}
            tileContent={tileContent}
            className="border-0 rounded-lg shadow-sm"
          />
        </div>
        
        <div className="mt-2 flex justify-center space-x-3 text-xs text-slate-300">
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-blue-500 mr-1"></div>
            <span>Focus</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-purple-500 mr-1"></div>
            <span>Meeting</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
            <span>Completed</span>
          </div>
        </div>
      </div>

      {/* Selected Date Events with better spacing */}
      {selectedDate && (
        <div className={`${currentTheme.colors.chatInputAreaBg} p-2 sm:p-3 rounded-lg shadow-md mb-3`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold flex items-center text-sm sm:text-base">
              <CalendarIcon className="h-4 w-4 mr-2 text-blue-400" />
              Events for {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            
            {getEventsForDate(selectedDate).length > 0 && (
              <button
                onClick={() => {
                  setShowAddEvent(true);
                  setNewEvent({
                    ...newEvent,
                    date: format(selectedDate, 'yyyy-MM-dd')
                  });
                }}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
              >
                <PlusIcon className="h-3 w-3 mr-1" /> Add Event
              </button>
            )}
          </div>
          
          <div className="space-y-1.5 max-h-[200px] sm:max-h-[250px] overflow-y-auto">
            {getEventsForDate(selectedDate).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4">
                <p className="text-slate-400 text-sm italic">No events scheduled for this date.</p>
                <button
                  onClick={() => {
                    setShowAddEvent(true);
                    setNewEvent({
                      ...newEvent,
                      date: format(selectedDate, 'yyyy-MM-dd')
                    });
                  }}
                  className="mt-2 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded-full text-white transition-colors"
                >
                  Add Event
                </button>
              </div>
            ) : (
              getEventsForDate(selectedDate).map(event => (
                <div 
                  key={event.id} 
                  className={`p-2 rounded-lg ${
                    event.completed 
                      ? `${currentTheme.colors.assistantMessageBg} border-l-4 border-green-500` 
                      : currentTheme.colors.userMessageBg
                  } relative group`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={event.completed}
                          onChange={() => toggleEventCompletion(event.id)}
                          className="mr-2 h-4 w-4 rounded border-gray-400 cursor-pointer"
                        />
                        <h4 className={`font-medium ${event.completed ? 'line-through opacity-70' : ''}`}>
                          {event.title}
                        </h4>
                      </div>
                      
                      {event.description && (
                        <p className="text-sm mt-1 text-slate-300">{event.description}</p>
                      )}
                      
                      {event.time && (
                        <div className="flex items-center mt-2 text-xs text-slate-400">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          <span>{event.time}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex ml-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        event.type === 'focus' ? 'bg-blue-600/50 text-blue-200' :
                        event.type === 'break' ? 'bg-green-600/50 text-green-200' :
                        event.type === 'meeting' ? 'bg-purple-600/50 text-purple-200' :
                        event.type === 'reminder' ? 'bg-yellow-600/50 text-yellow-200' :
                        'bg-slate-600/50 text-slate-200'
                      }`}>
                        {event.type}
                      </span>
                      
                      <div className="relative">
                        <button
                          onClick={() => setShowEventOptions(showEventOptions === event.id ? null : event.id)}
                          className="ml-2 text-slate-400 hover:text-slate-300 p-1"
                        >
                          <EllipsisVerticalIcon className="h-3 w-3" />
                        </button>
                        
                        {showEventOptions === event.id && (
                          <div className="absolute right-0 mt-1 w-32 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1" role="menu" aria-orientation="vertical">
                              <button
                                className="w-full text-left block px-4 py-2 text-xs text-slate-300 hover:bg-slate-700"
                                onClick={() => duplicateEvent(event.id)}
                              >
                                Duplicate
                              </button>
                              <button
                                className="w-full text-left block px-4 py-2 text-xs text-red-400 hover:bg-slate-700"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Event Form with adjusted spacing */}
      {showAddEvent && (
        <div className={`${currentTheme.colors.chatInputAreaBg} p-2 sm:p-3 rounded-lg shadow-md mb-3 relative`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-sm sm:text-base">Add New Event</h3>
            <button 
              onClick={() => setShowAddEvent(false)}
              className="text-slate-400 hover:text-slate-300"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Title</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                className={`w-full px-3 py-2 ${currentTheme.colors.chatInputBg} rounded ${currentTheme.colors.chatInputText} placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm`}
                placeholder="Event title"
              />
            </div>
            
            <div>
              <label className="block text-xs text-slate-300 mb-1">Description (optional)</label>
              <textarea
                value={newEvent.description}
                onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                className={`w-full px-3 py-2 ${currentTheme.colors.chatInputBg} rounded ${currentTheme.colors.chatInputText} placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm`}
                placeholder="Description"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  className={`w-full px-3 py-2 ${currentTheme.colors.chatInputBg} rounded ${currentTheme.colors.chatInputText} focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm`}
                />
              </div>
              
              <div>
                <label className="block text-xs text-slate-300 mb-1">Time (optional)</label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                  className={`w-full px-3 py-2 ${currentTheme.colors.chatInputBg} rounded ${currentTheme.colors.chatInputText} focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm`}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-slate-300 mb-1">Event Type</label>
              <div className="grid grid-cols-5 gap-1">
                {['focus', 'break', 'meeting', 'reminder', 'other'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewEvent({...newEvent, type: type as any})}
                    className={`py-1 text-xs rounded ${
                      newEvent.type === type
                        ? type === 'focus' ? 'bg-blue-600 text-white' :
                          type === 'break' ? 'bg-green-600 text-white' :
                          type === 'meeting' ? 'bg-purple-600 text-white' :
                          type === 'reminder' ? 'bg-yellow-600 text-white' :
                          'bg-slate-600 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowAddEvent(false)}
                className={`px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-white text-xs`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className={`px-3 py-1 ${currentTheme.colors.chatSendButtonBg} ${currentTheme.colors.chatSendButtonHoverBg} rounded ${currentTheme.colors.chatSendButtonText} text-xs`}
                disabled={!newEvent.title.trim()}
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCalendar; 