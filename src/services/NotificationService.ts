/**
 * Service for handling browser notifications
 */

export const NotificationService = {
  /**
   * Request permission to display browser notifications
   * @returns Promise<boolean> - Whether permission was granted
   */
  requestPermission: async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  },

  /**
   * Show a notification
   * @param title - Notification title
   * @param options - Notification options
   */
  showNotification: (title: string, options?: NotificationOptions): void => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, options);
    } else {
      console.log('Notification permission not granted');
    }
  }
}; 