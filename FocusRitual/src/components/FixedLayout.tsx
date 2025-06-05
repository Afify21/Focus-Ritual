import React, { useState } from 'react';
import Timer from './Timer';
import EnhancedTodoList from './EnhancedTodoList';
import Soundscape from './Soundscape';
import YouTubePlayer from './YouTubePlayer';
import SpotifyPlayer from './SpotifyPlayer';
import QuoteGenerator from './QuoteGenerator';
import { useTheme } from '../context/ThemeContext';
import FocusModePage from '../pages/FocusModePage';

const FixedLayout: React.FC = () => {
  const [timerDuration, setTimerDuration] = useState(1500); // default 25m
  const [timerState, setTimerState] = useState<any>({});
  const [showYouTube, setShowYouTube] = useState(false);
  const [showSpotify, setShowSpotify] = useState(false);
  const { currentTheme } = useTheme();
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="FocusRitual" className="h-8 w-8" />
          <h1 className="text-2xl font-bold text-white">FocusRitual</h1>
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm">
            Show Themes
          </button>
          <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm">
            Habits & Analysis
          </button>
          <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm">
            Calendar
          </button>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Duration Selection */}
          <div className="bg-slate-800 bg-opacity-80 rounded-lg p-4 shadow-lg">
            <h2 className="text-lg font-medium text-white mb-3">Select Duration</h2>
            <div className="flex gap-2">
              {[{label: '25m', value: 1500}, {label: '50m', value: 3000}, {label: '90m', value: 5400}].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTimerDuration(opt.value)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${timerDuration === opt.value ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Timer */}
          <div className="bg-slate-800 bg-opacity-80 rounded-lg p-6 shadow-lg flex flex-col items-center">
            <Timer 
              duration={timerDuration} 
              onStateChange={setTimerState} 
              isMinimized={false} 
            />
            <div className="flex gap-3 mt-4">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white flex items-center gap-1">
                <span>Start</span>
              </button>
              <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white flex items-center gap-1">
                <span>Reset</span>
              </button>
              <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white flex items-center gap-1">
                <span>Skip</span>
              </button>
            </div>
            <div className="text-center mt-2 text-sm text-slate-400">
              <p>Focus Time</p>
              <p>Completed Sessions: 0</p>
            </div>
          </div>
          
          {/* Media Players */}
          <div className="bg-slate-800 bg-opacity-80 rounded-lg p-4 shadow-lg">
            <h2 className="text-lg font-medium text-white mb-3">Media Players</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => { setShowYouTube(!showYouTube); setShowSpotify(false); }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white"
              >
                Show YouTube
              </button>
              <button 
                onClick={() => { setShowSpotify(!showSpotify); setShowYouTube(false); }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white"
              >
                Show Spotify
              </button>
            </div>
            {showYouTube && (
              <div className="mt-3">
                <YouTubePlayer onClose={() => setShowYouTube(false)} isFocusMode={false} />
              </div>
            )}
            {showSpotify && (
              <div className="mt-3">
                <SpotifyPlayer onClose={() => setShowSpotify(false)} isFocusMode={false} />
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Ambient Sounds */}
          <div className="bg-slate-800 bg-opacity-80 rounded-lg p-4 shadow-lg">
            <h2 className="text-lg font-medium text-white mb-3">Ambient Sounds</h2>
            <Soundscape />
          </div>
          
          {/* Task List */}
          <div className="bg-slate-800 bg-opacity-80 rounded-lg p-4 shadow-lg">
            <h2 className="text-lg font-medium text-white mb-3">Task List</h2>
            <EnhancedTodoList />
          </div>
          
          {/* Habit Tracker */}
          <div className="bg-slate-800 bg-opacity-80 rounded-lg p-4 shadow-lg">
            <h2 className="text-lg font-medium text-white mb-3">Habit Tracker</h2>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-slate-300">Today's progress</p>
              <p className="text-sm text-slate-300">2 / 2 completed</p>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-slate-700 bg-opacity-50 rounded">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-white">WATER</span>
                <span className="text-xs text-slate-400 ml-auto">8 cups</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-700 bg-opacity-50 rounded">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-white">build the project</span>
                <span className="text-xs text-slate-400 ml-auto">1 day</span>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button className="text-sm text-blue-400 hover:text-blue-300">View All →</button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-4 right-4 z-[10001]">
        <button className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white shadow-lg">
          Enter Focus Mode
        </button>
      </div>
      
      <div className="fixed bottom-4 left-4 z-[10001] text-sm text-slate-400 italic">
        <p>"Take regular breaks every 25 minutes to maintain peak productivity."</p>
        <p className="text-xs">- Study Tip</p>
      </div>
    </div>
  );
};

export default FixedLayout;