import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ThemeSelector } from '../components/ThemeSelector';
import DataService, { UserSettings } from '../services/DataService';
import NotificationSettings from '../components/NotificationSettings';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings>(DataService.Settings.getSettings());
  const [displayName, setDisplayName] = useState(settings.displayName || '');
  const [focusGoals, setFocusGoals] = useState(settings.focusGoals || '');
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled);
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  // Save settings to localStorage when they change
  const saveSettings = () => {
    const updatedSettings = {
      ...settings,
      displayName,
      focusGoals,
      soundEnabled,
      notificationsEnabled
    };
    
    DataService.Settings.saveSettings(updatedSettings);
    setSettings(updatedSettings);
    
    // Show success message
    setShowSaveMessage(true);
    setTimeout(() => {
      setShowSaveMessage(false);
    }, 3000);
  };

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
            <h1 className="text-xl md:text-3xl font-bold">Settings</h1>
          </div>
          
          <button 
            onClick={saveSettings}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white flex items-center"
          >
            <CheckIcon className="h-5 w-5 mr-2" />
            Save Settings
          </button>
        </div>

        {/* Success message */}
        {showSaveMessage && (
          <div className="mb-4 p-3 bg-green-600/20 border border-green-500 rounded-lg flex items-center">
            <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* Main content */}
        <div className="space-y-6">
          {/* Profile Settings */}
          <div className={`${currentTheme.colors.chatMessageListBg} backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-xl`}>
            <h2 className="text-xl font-bold mb-4">Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-slate-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="focusGoals" className="block text-sm font-medium text-slate-300 mb-1">
                  Focus Goals
                </label>
                <textarea
                  id="focusGoals"
                  value={focusGoals}
                  onChange={(e) => setFocusGoals(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="What are your productivity goals?"
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          {/* Theme Settings */}
          <div className={`${currentTheme.colors.chatMessageListBg} backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-xl`}>
            <h2 className="text-xl font-bold mb-4">Appearance</h2>
            <ThemeSelector />
          </div>
          
          {/* Notification Settings */}
          <div className={`${currentTheme.colors.chatMessageListBg} backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-xl`}>
            <h2 className="text-xl font-bold mb-4">Notifications</h2>
            
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg mb-4">
              <div>
                <h3 className="font-medium">Enable Notifications</h3>
                <p className="text-sm text-slate-400">Get notified about focus sessions and habits</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notificationsEnabled}
                  onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {notificationsEnabled && <NotificationSettings />}
          </div>
          
          {/* Sound Settings */}
          <div className={`${currentTheme.colors.chatMessageListBg} backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-xl`}>
            <h2 className="text-xl font-bold mb-4">Sound</h2>
            
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg mb-4">
              <div>
                <h3 className="font-medium">Enable Sounds</h3>
                <p className="text-sm text-slate-400">Play sounds for timers and notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={soundEnabled}
                  onChange={() => setSoundEnabled(!soundEnabled)}
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          {/* Data Management */}
          <div className={`${currentTheme.colors.chatMessageListBg} backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-xl`}>
            <h2 className="text-xl font-bold mb-4">Data Management</h2>
            
            <div className="space-y-4">
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <h3 className="font-medium mb-2">Export Data</h3>
                <p className="text-sm text-slate-400 mb-3">
                  Export all your app data including habits, events, and settings as a JSON file.
                </p>
                <button 
                  onClick={() => {
                    // Prepare data to export
                    const exportData = {
                      habits: DataService.Habits.getHabits(),
                      events: DataService.Events.getEvents(),
                      settings: DataService.Settings.getSettings(),
                      sessions: DataService.Sessions.getSessions(),
                      tasks: DataService.Tasks.getTasks()
                    };
                    
                    // Create blob and download
                    const dataStr = JSON.stringify(exportData, null, 2);
                    const blob = new Blob([dataStr], {type: 'application/json'});
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.setAttribute('hidden', '');
                    a.setAttribute('href', url);
                    a.setAttribute('download', 'focus-ritual-data.json');
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white text-sm"
                >
                  Export All Data
                </button>
              </div>
              
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <h3 className="font-medium mb-2">Clear Data</h3>
                <p className="text-sm text-slate-400 mb-3">
                  Warning: This will permanently delete all your data and reset the app.
                </p>
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white text-sm"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
          
          {/* About Section */}
          <div className={`${currentTheme.colors.chatMessageListBg} backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-xl`}>
            <h2 className="text-xl font-bold mb-4">About</h2>
            
            <div className="text-center py-4">
              <h3 className="text-2xl font-bold mb-1">Focus Ritual</h3>
              <p className="text-slate-400 mb-4">Version 1.0.0</p>
              <p className="text-slate-300 max-w-md mx-auto">
                An all-in-one productivity app to help you build better focus habits,
                track your progress, and achieve your goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 