import { NotificationService } from './NotificationService';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: string;
  frequency: {
    type: 'daily' | 'weekly' | 'custom';
    days?: number[];
    time?: string;
  };
  completionHistory: {
    [date: string]: boolean;
  };
  streak: number;
  createdAt: string;
  goalDuration: number;
  goalCompleted: boolean;
  goalCompletedAt?: string;
}

export const HabitReminderService = {
  /**
   * Check all habits and send notifications for those due at current time
   * @param habits - List of habits to check
   */
  checkHabits: (habits: Habit[]): void => {
    if (!habits || habits.length === 0) return;

    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDateString = now.toISOString().split('T')[0]; // YYYY-MM-DD

    for (const habit of habits) {
      // Skip if no reminder time is set
      if (!habit.frequency.time) continue;

      // Skip if habit was already completed today
      if (habit.completionHistory[currentDateString]) continue;

      // Parse reminder time
      const [hours, minutes] = habit.frequency.time.split(':').map(num => parseInt(num, 10));

      // Check if it's time for reminder (within a 5-minute window)
      const isTimeMatch = Math.abs(currentHour - hours) === 0 && Math.abs(currentMinute - minutes) < 5;
      if (!isTimeMatch) continue;

      // Check if habit is scheduled for today based on frequency
      let isDueToday = false;

      switch (habit.frequency.type) {
        case 'daily':
          isDueToday = true;
          break;
        case 'weekly':
        case 'custom':
          // Check if current day is in the scheduled days
          isDueToday = habit.frequency.days?.includes(currentDay) || false;
          break;
      }

      if (isDueToday) {
        // Send notification
        NotificationService.showNotification(
          `Reminder: ${habit.name}`,
          {
            body: habit.description || 'Time to complete your habit!',
            icon: '/logo192.png', // Use your app logo
            tag: `habit-${habit.id}`, // Prevents duplicate notifications
          }
        );
      }
    }
  },

  /**
   * Start checking for habit reminders every minute
   * @param getHabits - Function to get the current list of habits
   * @returns Function to stop the reminders
   */
  startReminderChecks: (getHabits: () => Habit[]): (() => void) => {
    // Request notification permission first
    NotificationService.requestPermission();

    // Check immediately
    HabitReminderService.checkHabits(getHabits());

    // Set interval to check every minute
    const intervalId = setInterval(() => {
      HabitReminderService.checkHabits(getHabits());
    }, 60000); // 60000 ms = 1 minute

    // Return function to stop the reminders
    return () => clearInterval(intervalId);
  }
}; 