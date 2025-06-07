import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { preferencesAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('light');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setName(user.name);
      setTheme(user.preferences.theme);
      setNotificationsEnabled(user.preferences.notificationsEnabled);
      setFocusDuration(user.preferences.focusSessionDefaults.duration);
      setBreakDuration(user.preferences.focusSessionDefaults.breakDuration);
    }
  }, [user]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      await preferencesAPI.updatePreferences({
        name,
        preferences: {
          theme,
          notificationsEnabled,
          focusSessionDefaults: {
            duration: focusDuration,
            breakDuration
          }
        }
      });
      
      setMessage({ text: 'Profile updated successfully', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-medium text-gray-900 dark:text-white">Profile Settings</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
          
          {message && (
            <div className={`px-4 py-3 border ${message.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'}`} role="alert">
              <span className="block sm:inline">{message.text}</span>
            </div>
          )}
          
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Account Information</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update your account details</p>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 text-gray-500 sm:text-sm dark:bg-gray-600 dark:border-gray-600 dark:text-gray-400"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                  </div>
                </div>
                
                <div className="pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Preferences</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Customize your experience</p>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Theme
                    </label>
                    <select
                      id="theme"
                      name="theme"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="forest">Forest</option>
                      <option value="ocean">Ocean</option>
                      <option value="sunset">Sunset</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center h-full pt-6">
                    <div className="flex items-center">
                      <input
                        id="notifications"
                        name="notifications"
                        type="checkbox"
                        checked={notificationsEnabled}
                        onChange={(e) => setNotificationsEnabled(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="notifications" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enable notifications
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Focus Session Defaults</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Set your default timer durations</p>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="focusDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Focus Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="focusDuration"
                      id="focusDuration"
                      min="1"
                      max="120"
                      value={focusDuration}
                      onChange={(e) => setFocusDuration(parseInt(e.target.value))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="breakDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Break Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="breakDuration"
                      id="breakDuration"
                      min="1"
                      max="60"
                      value={breakDuration}
                      onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 