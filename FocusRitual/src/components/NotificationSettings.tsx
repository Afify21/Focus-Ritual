import React, { useState, useEffect } from 'react';
import { BellIcon, BellSlashIcon } from '@heroicons/react/24/solid';
import { NotificationService } from '../services/NotificationService';

interface NotificationSettingsProps {
  className?: string;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ className = '' }) => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  
  useEffect(() => {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      setPermissionStatus('unsupported');
      return;
    }
    
    // Get initial permission status
    setPermissionStatus(Notification.permission);
    
    // Listen for permission changes
    const checkPermission = () => {
      setPermissionStatus(Notification.permission);
    };
    
    document.addEventListener('visibilitychange', checkPermission);
    
    return () => {
      document.removeEventListener('visibilitychange', checkPermission);
    };
  }, []);
  
  const requestPermission = async () => {
    const granted = await NotificationService.requestPermission();
    if (granted) {
      setPermissionStatus('granted');
      // Show a test notification
      NotificationService.showNotification(
        'Notifications Enabled', 
        { body: 'You will now receive reminders for your habits.' }
      );
    } else {
      setPermissionStatus(Notification.permission);
    }
  };
  
  if (permissionStatus === 'unsupported') {
    return (
      <div className={`bg-slate-700/70 p-3 rounded-lg text-sm ${className}`}>
        <div className="flex items-center">
          <BellSlashIcon className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-slate-300">Notifications are not supported in this browser.</span>
        </div>
      </div>
    );
  }
  
  if (permissionStatus === 'denied') {
    return (
      <div className={`bg-slate-700/70 p-3 rounded-lg text-sm ${className}`}>
        <div className="flex items-center">
          <BellSlashIcon className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-slate-300">
            Notifications are blocked. Please enable them in your browser settings.
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-slate-700/70 p-3 rounded-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BellIcon className="h-5 w-5 text-blue-400 mr-2" />
          <span className="text-white">Habit Reminders</span>
        </div>
        
        {permissionStatus === 'granted' ? (
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
            Enabled
          </span>
        ) : (
          <button
            onClick={requestPermission}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded"
          >
            Enable Notifications
          </button>
        )}
      </div>
      
      {permissionStatus === 'granted' && (
        <p className="mt-2 text-xs text-slate-300">
          You'll receive notifications when it's time to complete your habits.
        </p>
      )}
      
      {permissionStatus === 'default' && (
        <p className="mt-2 text-xs text-slate-300">
          Enable notifications to be reminded when it's time to complete your habits.
        </p>
      )}
    </div>
  );
};

export default NotificationSettings; 