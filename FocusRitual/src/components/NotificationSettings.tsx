import React, { useState } from 'react';
import { BellIcon, ClockIcon, PencilIcon } from '@heroicons/react/24/solid';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'focus-reminder',
      label: 'Focus Session Reminders',
      description: 'Get reminders for scheduled focus sessions',
      enabled: true
    },
    {
      id: 'habit-reminder',
      label: 'Habit Reminders',
      description: 'Get reminders to complete your daily habits',
      enabled: true
    },
    {
      id: 'event-reminder',
      label: 'Event Notifications',
      description: 'Get notified about upcoming calendar events',
      enabled: true
    },
    {
      id: 'achievement',
      label: 'Achievement Notifications',
      description: 'Get notified when you earn new achievements',
      enabled: true
    }
  ]);

  const toggleSetting = (id: string) => {
    setSettings(settings.map(setting => 
      setting.id === id 
        ? { ...setting, enabled: !setting.enabled } 
        : setting
    ));
  };

  return (
    <div className="space-y-3">
      {settings.map(setting => (
        <div 
          key={setting.id}
          className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
        >
          <div>
            <h3 className="font-medium">{setting.label}</h3>
            <p className="text-sm text-slate-400">{setting.description}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={setting.enabled}
              onChange={() => toggleSetting(setting.id)}
            />
            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      ))}
      
      <div className="p-3 bg-slate-700/30 rounded-lg">
        <h3 className="font-medium flex items-center">
          <ClockIcon className="h-4 w-4 mr-2 text-blue-400" />
          Quiet Hours
        </h3>
        <p className="text-sm text-slate-400 mb-3">
          Don't send notifications during these hours
        </p>
        
        <div className="flex space-x-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">From</label>
            <input 
              type="time" 
              defaultValue="22:00"
              className="w-full px-3 py-1 bg-slate-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">To</label>
            <input 
              type="time" 
              defaultValue="07:00"
              className="w-full px-3 py-1 bg-slate-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-slate-700/30 rounded-lg">
        <h3 className="font-medium flex items-center">
          <BellIcon className="h-4 w-4 mr-2 text-blue-400" />
          Notification Style
        </h3>
        <p className="text-sm text-slate-400 mb-3">
          Choose how notifications appear
        </p>
        
        <div className="space-y-2">
          <label className="flex items-center">
            <input 
              type="radio" 
              name="notification-style" 
              className="mr-2"
              defaultChecked 
            />
            <span>Standard (sound + popup)</span>
          </label>
          <label className="flex items-center">
            <input 
              type="radio" 
              name="notification-style" 
              className="mr-2" 
            />
            <span>Silent (popup only)</span>
          </label>
          <label className="flex items-center">
            <input 
              type="radio" 
              name="notification-style" 
              className="mr-2" 
            />
            <span>Minimalist (badge only)</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings; 