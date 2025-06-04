import React, { useState, useEffect } from 'react';
import { format, formatDistance } from 'date-fns';
import { ClockIcon, ChartBarIcon, FireIcon, TrashIcon, CalendarIcon, FaceFrownIcon, FaceSmileIcon } from '@heroicons/react/24/solid';
import DataService, { FocusSession } from '../services/DataService';
import { useTheme } from '../context/ThemeContext';

interface SessionHistoryProps {
  compact?: boolean;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ compact = false }) => {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    totalFocusTime: 0, // in seconds
    averageProductivity: 0,
    longestSession: 0, // in seconds
    currentStreak: 0
  });
  const { currentTheme } = useTheme();
  
  useEffect(() => {
    // Load sessions from localStorage
    const loadSessions = () => {
      const sessions = DataService.Sessions.getSessions();
      
      // Sort by date (newest first)
      const sortedSessions = [...sessions].sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      
      setSessions(sortedSessions);
      calculateStats(sortedSessions);
    };
    
    loadSessions();
    
    // Listen for storage events
    const handleStorageChange = () => {
      loadSessions();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const calculateStats = (sessions: FocusSession[]) => {
    const completedSessions = sessions.filter(s => s.completed);
    const totalFocusTime = completedSessions.reduce((sum, s) => sum + s.duration, 0);
    const averageProductivity = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.feedback?.productivity || 0), 0) / completedSessions.length
      : 0;
    const longestSession = completedSessions.length > 0
      ? Math.max(...completedSessions.map(s => s.duration))
      : 0;
    
    // Calculate current streak
    let currentStreak = 0;
    const sortedDates = Array.from(new Set(completedSessions
      .map(s => new Date(s.startTime).toISOString().split('T')[0])
    )).sort().reverse(); // Get unique dates and sort newest first
    
    if (sortedDates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      // Check if user has completed a session today or yesterday to maintain streak
      const hasRecentSession = sortedDates[0] === today || sortedDates[0] === yesterday;
      
      if (hasRecentSession) {
        currentStreak = 1; // Count today/yesterday
        
        // Count consecutive days before today/yesterday
        for (let i = 1; i < sortedDates.length; i++) {
          const currentDate = new Date(sortedDates[i]);
          const previousDate = new Date(sortedDates[i - 1]);
          
          // Check if dates are consecutive
          const diffTime = previousDate.getTime() - currentDate.getTime();
          const diffDays = diffTime / (1000 * 60 * 60 * 24);
          
          if (Math.round(diffDays) === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }
    
    setStats({
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      totalFocusTime,
      averageProductivity,
      longestSession,
      currentStreak
    });
  };
  
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };
  
  const deleteSession = (id: string) => {
    const updatedSessions = sessions.filter(s => s.id !== id);
    DataService.Sessions.saveSessions(updatedSessions);
    setSessions(updatedSessions);
    calculateStats(updatedSessions);
  };
  
  const getProductivityEmoji = (productivity?: number): string => {
    if (!productivity) return '😐';
    if (productivity >= 8) return '😄';
    if (productivity >= 6) return '🙂';
    if (productivity >= 4) return '😐';
    if (productivity >= 2) return '🙁';
    return '😞';
  };
  
  const getProductivityColor = (productivity?: number): string => {
    if (!productivity) return 'text-slate-400';
    if (productivity >= 8) return 'text-green-400';
    if (productivity >= 6) return 'text-blue-400';
    if (productivity >= 4) return 'text-yellow-400';
    if (productivity >= 2) return 'text-orange-400';
    return 'text-red-400';
  };
  
  return (
    <div className={`${currentTheme.colors.chatMessageListBg} backdrop-blur-sm p-4 rounded-xl shadow-xl ${compact ? 'scale-95 origin-top' : ''}`}>
      <h2 className="text-lg font-bold mb-4">Focus Session History</h2>
      
      {/* Stats Summary */}
      {!compact && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-700/50 p-3 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">Total Focus Time</div>
            <div className="text-xl font-bold text-blue-400 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              {formatDuration(stats.totalFocusTime)}
            </div>
          </div>
          
          <div className="bg-slate-700/50 p-3 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">Avg Productivity</div>
            <div className="text-xl font-bold text-green-400 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              {stats.averageProductivity.toFixed(1)}/10
            </div>
          </div>
          
          <div className="bg-slate-700/50 p-3 rounded-lg">
            <div className="text-sm text-slate-400 mb-1">Current Streak</div>
            <div className="text-xl font-bold text-yellow-400 flex items-center">
              <FireIcon className="h-5 w-5 mr-2" />
              {stats.currentStreak} day{stats.currentStreak !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}
      
      {/* Sessions List */}
      <div className={`space-y-2 ${compact ? 'max-h-[200px]' : 'max-h-[350px]'} overflow-y-auto pr-1`}>
        {sessions.length === 0 ? (
          <div className="text-center py-6 text-slate-400 italic">
            No focus sessions recorded yet. Complete a focus session to start tracking your progress.
          </div>
        ) : (
          sessions.slice(0, compact ? 3 : undefined).map(session => (
            <div
              key={session.id}
              className={`p-3 rounded-lg ${session.completed 
                ? `${currentTheme.colors.assistantMessageBg} border-l-4 border-green-500` 
                : currentTheme.colors.userMessageBg
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className={`font-medium ${session.completed ? '' : 'text-slate-400'}`}>
                      {formatDuration(session.duration)} Focus Session
                    </span>
                    {!session.completed && (
                      <span className="ml-2 px-2 py-0.5 bg-slate-700 rounded-full text-xs text-slate-300">
                        Incomplete
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center mt-1 text-xs text-slate-400">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    <span>
                      {format(new Date(session.startTime), 'MMM d, yyyy')} • {format(new Date(session.startTime), 'h:mm a')}
                    </span>
                  </div>
                  
                  {session.feedback && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <div>
                        <div className="text-xs text-slate-400">Productivity</div>
                        <div className={`text-sm font-medium ${getProductivityColor(session.feedback.productivity)}`}>
                          {getProductivityEmoji(session.feedback.productivity)} {session.feedback.productivity}/10
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-slate-400">Distractions</div>
                        <div className="text-sm font-medium text-slate-300">
                          {session.feedback.distractions}/10
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-slate-400">Mood</div>
                        <div className="text-sm font-medium text-slate-300">
                          {session.feedback.mood}/10
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {session.feedback?.notes && !compact && (
                    <div className="mt-2 text-sm text-slate-300 italic">
                      "{session.feedback.notes}"
                    </div>
                  )}
                </div>
                
                {!compact && (
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="text-slate-400 hover:text-red-400 p-1"
                    aria-label="Delete session"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        
        {compact && sessions.length > 3 && (
          <div className="text-center mt-2">
            <button
              onClick={() => window.location.href = '/analytics'}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              View all {sessions.length} sessions →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionHistory; 