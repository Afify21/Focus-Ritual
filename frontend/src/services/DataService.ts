import { v4 as uuidv4 } from 'uuid';

// Interfaces for the different data types
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
  color?: string;
  createdAt: string;
  goalDuration: number;
  goalCompleted: boolean;
  goalCompletedAt?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO string
  time?: string; // HH:MM format
  type: 'focus' | 'break' | 'meeting' | 'reminder' | 'other';
  completed?: boolean;
}

export interface UserSettings {
  theme: string;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  focusGoals?: string;
  displayName?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  threshold?: number;
  date?: string;
}

// Storage keys
const STORAGE_KEYS = {
  HABITS: 'focus-ritual-habits',
  EVENTS: 'focus-ritual-events',
  SETTINGS: 'focus-ritual-settings',
  ACHIEVEMENTS: 'focus-ritual-achievements',
  HABIT_GOALS: 'focus-ritual-habit-goals',
  SESSION_HISTORY: 'focus-ritual-session-history',
  TASKS: 'focus-ritual-tasks'
};

// Helper for localStorage operations with error handling
const safeStorage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error retrieving ${key} from localStorage:`, error);
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Dispatch a storage event so other components can react
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error(`Error storing ${key} in localStorage:`, error);
    }
  }
};

// Habit Service
export const HabitService = {
  getHabits: (): Habit[] => {
    return safeStorage.get<Habit[]>(STORAGE_KEYS.HABITS, []);
  },

  saveHabits: (habits: Habit[]): void => {
    safeStorage.set(STORAGE_KEYS.HABITS, habits);
  },

  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completionHistory' | 'goalCompleted' | 'goalCompletedAt'>): Habit => {
    const habits = HabitService.getHabits();
    const newHabit: Habit = {
      id: uuidv4(),
      ...habit,
      streak: 0,
      completionHistory: {},
      createdAt: new Date().toISOString(),
      goalCompleted: false,
      goalCompletedAt: undefined
    };

    habits.push(newHabit);
    HabitService.saveHabits(habits);
    return newHabit;
  },

  updateHabit: (updatedHabit: Habit): Habit => {
    const habits = HabitService.getHabits();
    const index = habits.findIndex(h => h.id === updatedHabit.id);

    if (index !== -1) {
      habits[index] = updatedHabit;
      HabitService.saveHabits(habits);
    }

    return updatedHabit;
  },

  deleteHabit: (id: string): void => {
    const habits = HabitService.getHabits();
    const filteredHabits = habits.filter(h => h.id !== id);
    HabitService.saveHabits(filteredHabits);
  },

  toggleHabitCompletion: (habitId: string, date: string): Habit | null => {
    const habits = HabitService.getHabits();
    const index = habits.findIndex(h => h.id === habitId);

    if (index !== -1) {
      const habit = habits[index];
      const wasCompleted = habit.completionHistory[date];

      // Update completion history
      habit.completionHistory = {
        ...habit.completionHistory,
        [date]: !wasCompleted
      };

      // Recalculate streak
      let streak = 0;
      const currentDate = new Date();
      let consecutiveDays = true;

      for (let i = 0; consecutiveDays && i < 100; i++) {
        const checkDate = new Date();
        checkDate.setDate(currentDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];

        if (habit.completionHistory[dateStr]) {
          streak++;
        } else {
          consecutiveDays = false;
        }
      }

      habit.streak = streak;
      habits[index] = habit;
      HabitService.saveHabits(habits);
      return habit;
    }

    return null;
  },

  getHabitGoals: (): string => {
    return safeStorage.get<string>(STORAGE_KEYS.HABIT_GOALS, '');
  },

  saveHabitGoals: (goals: string): void => {
    safeStorage.set(STORAGE_KEYS.HABIT_GOALS, goals);
  }
};

// Calendar Event Service
export const EventService = {
  getEvents: (): CalendarEvent[] => {
    return safeStorage.get<CalendarEvent[]>(STORAGE_KEYS.EVENTS, []);
  },

  saveEvents: (events: CalendarEvent[]): void => {
    safeStorage.set(STORAGE_KEYS.EVENTS, events);
  },

  addEvent: (event: Omit<CalendarEvent, 'id'>): CalendarEvent => {
    const events = EventService.getEvents();
    const newEvent: CalendarEvent = {
      id: uuidv4(),
      ...event
    };

    events.push(newEvent);
    EventService.saveEvents(events);
    return newEvent;
  },

  updateEvent: (updatedEvent: CalendarEvent): CalendarEvent => {
    const events = EventService.getEvents();
    const index = events.findIndex(e => e.id === updatedEvent.id);

    if (index !== -1) {
      events[index] = updatedEvent;
      EventService.saveEvents(events);
    }

    return updatedEvent;
  },

  deleteEvent: (id: string): void => {
    const events = EventService.getEvents();
    const filteredEvents = events.filter(e => e.id !== id);
    EventService.saveEvents(filteredEvents);
  },

  toggleEventCompletion: (eventId: string): CalendarEvent | null => {
    const events = EventService.getEvents();
    const index = events.findIndex(e => e.id === eventId);

    if (index !== -1) {
      const event = events[index];
      event.completed = !event.completed;
      events[index] = event;
      EventService.saveEvents(events);
      return event;
    }

    return null;
  }
};

// Achievement Service
export const AchievementService = {
  getAchievements: (): Achievement[] => {
    return safeStorage.get<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, []);
  },

  saveAchievements: (achievements: Achievement[]): void => {
    safeStorage.set(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  },

  initializeAchievements: (): Achievement[] => {
    const existingAchievements = AchievementService.getAchievements();

    if (existingAchievements.length > 0) {
      return existingAchievements;
    }

    const defaultAchievements: Achievement[] = [
      {
        id: 'first-habit',
        title: 'Getting Started',
        description: 'Create your first habit',
        icon: '🌱',
        unlocked: false
      },
      {
        id: 'three-day-streak',
        title: 'Building Momentum',
        description: 'Maintain a 3-day streak on any habit',
        icon: '🔥',
        unlocked: false,
        progress: 0,
        threshold: 3
      },
      {
        id: 'seven-day-streak',
        title: 'Consistency Champion',
        description: 'Maintain a 7-day streak on any habit',
        icon: '🏆',
        unlocked: false,
        progress: 0,
        threshold: 7
      },
      {
        id: 'fourteen-day-streak',
        title: 'Habit Master',
        description: 'Maintain a 14-day streak on any habit',
        icon: '👑',
        unlocked: false,
        progress: 0,
        threshold: 14
      },
      {
        id: 'thirty-day-streak',
        title: 'Habit Legend',
        description: 'Maintain a 30-day streak on any habit',
        icon: '⭐',
        unlocked: false,
        progress: 0,
        threshold: 30
      },
      {
        id: 'sixty-day-streak',
        title: 'Unstoppable',
        description: 'Maintain a 60-day streak on any habit',
        icon: '🔱',
        unlocked: false,
        progress: 0,
        threshold: 60
      },
      {
        id: 'five-habits',
        title: 'Habit Collector',
        description: 'Track 5 different habits',
        icon: '🌟',
        unlocked: false,
        progress: 0,
        threshold: 5
      },
      {
        id: 'ten-habits',
        title: 'Habit Enthusiast',
        description: 'Track 10 different habits',
        icon: '🌠',
        unlocked: false,
        progress: 0,
        threshold: 10
      },
      {
        id: 'perfect-week',
        title: 'Perfect Week',
        description: 'Complete all habits for 7 days straight',
        icon: '🎯',
        unlocked: false,
        progress: 0,
        threshold: 7
      },
      {
        id: 'perfect-month',
        title: 'Perfect Month',
        description: 'Complete all habits for 30 days straight',
        icon: '📊',
        unlocked: false,
        progress: 0,
        threshold: 30
      },
      {
        id: 'first-calendar-event',
        title: 'Planning Ahead',
        description: 'Create your first calendar event',
        icon: '📅',
        unlocked: false
      },
      {
        id: 'five-calendar-events',
        title: 'Event Organizer',
        description: 'Create 5 calendar events',
        icon: '📆',
        unlocked: false,
        progress: 0,
        threshold: 5
      },
      {
        id: 'ten-calendar-events',
        title: 'Planning Pro',
        description: 'Create 10 calendar events',
        icon: '🗓️',
        unlocked: false,
        progress: 0,
        threshold: 10
      },
      {
        id: 'five-focus-sessions',
        title: 'Focus Beginner',
        description: 'Complete 5 focus sessions',
        icon: '🧘',
        unlocked: false,
        progress: 0,
        threshold: 5
      },
      {
        id: 'ten-focus-sessions',
        title: 'Focus Master',
        description: 'Complete 10 focus sessions',
        icon: '🧠',
        unlocked: false,
        progress: 0,
        threshold: 10
      },
      {
        id: 'twenty-five-focus-sessions',
        title: 'Concentration Guru',
        description: 'Complete 25 focus sessions',
        icon: '🧿',
        unlocked: false,
        progress: 0,
        threshold: 25
      },
      {
        id: 'fifty-focus-sessions',
        title: 'Zen Master',
        description: 'Complete 50 focus sessions',
        icon: '🔮',
        unlocked: false,
        progress: 0,
        threshold: 50
      },
      {
        id: 'hundred-focus-sessions',
        title: 'Focus Legend',
        description: 'Complete 100 focus sessions',
        icon: '💎',
        unlocked: false,
        progress: 0,
        threshold: 100
      },
      {
        id: 'first-task',
        title: 'Task Tracker',
        description: 'Create your first task',
        icon: '📝',
        unlocked: false
      },
      {
        id: 'ten-tasks-completed',
        title: 'Task Completer',
        description: 'Complete 10 tasks',
        icon: '✅',
        unlocked: false,
        progress: 0,
        threshold: 10
      },
      {
        id: 'fifty-tasks-completed',
        title: 'Productivity Champion',
        description: 'Complete 50 tasks',
        icon: '✨',
        unlocked: false,
        progress: 0,
        threshold: 50
      },
      {
        id: 'morning-routine',
        title: 'Early Bird',
        description: 'Complete 5 habits before 9 AM',
        icon: '🌅',
        unlocked: false,
        progress: 0,
        threshold: 5
      },
      {
        id: 'night-owl',
        title: 'Night Owl',
        description: 'Complete 5 habits after 9 PM',
        icon: '🌙',
        unlocked: false,
        progress: 0,
        threshold: 5
      },
      {
        id: 'weekend-warrior',
        title: 'Weekend Warrior',
        description: 'Complete all habits on weekends for 4 consecutive weeks',
        icon: '🏋️',
        unlocked: false,
        progress: 0,
        threshold: 4
      },
      {
        id: 'theme-explorer',
        title: 'Theme Explorer',
        description: 'Try at least 3 different themes',
        icon: '🎨',
        unlocked: false,
        progress: 0,
        threshold: 3
      },
      {
        id: 'consistent-feedback',
        title: 'Reflective Mind',
        description: 'Provide feedback for 10 focus sessions',
        icon: '🤔',
        unlocked: false,
        progress: 0,
        threshold: 10
      },
      {
        id: 'habit-categories',
        title: 'Well-Rounded',
        description: 'Create habits in at least 5 different categories',
        icon: '🔄',
        unlocked: false,
        progress: 0,
        threshold: 5
      },
      {
        id: 'first-week',
        title: 'One Week Wonder',
        description: 'Use the app for 7 consecutive days',
        icon: '🎉',
        unlocked: false,
        progress: 0,
        threshold: 7
      },
      {
        id: 'first-month',
        title: 'Monthly Momentum',
        description: 'Use the app for 30 consecutive days',
        icon: '🚀',
        unlocked: false,
        progress: 0,
        threshold: 30
      },
      {
        id: 'ninety-day-streak',
        title: 'Iron Will',
        description: 'Maintain a 90-day streak on any habit',
        icon: '⚔️',
        unlocked: false,
        progress: 0,
        threshold: 90
      },
      {
        id: 'hundred-day-streak',
        title: 'Century Club',
        description: 'Maintain a 100-day streak on any habit',
        icon: '🏅',
        unlocked: false,
        progress: 0,
        threshold: 100
      },
      {
        id: 'six-month-streak',
        title: 'Half-Year Hero',
        description: 'Maintain a 180-day streak on any habit',
        icon: '🌟',
        unlocked: false,
        progress: 0,
        threshold: 180
      },
      {
        id: 'year-streak',
        title: 'Year of Discipline',
        description: 'Maintain a 365-day streak on any habit',
        icon: '🏆',
        unlocked: false,
        progress: 0,
        threshold: 365
      },
      {
        id: 'three-habits-streak',
        title: 'Triple Threat',
        description: 'Maintain a 7-day streak on 3 different habits simultaneously',
        icon: '🔄',
        unlocked: false,
        progress: 0,
        threshold: 3
      },
      {
        id: 'five-habits-streak',
        title: 'Pentagon Power',
        description: 'Maintain a 7-day streak on 5 different habits simultaneously',
        icon: '🌀',
        unlocked: false,
        progress: 0,
        threshold: 5
      },
      {
        id: 'fifteen-habits',
        title: 'Habit Aficionado',
        description: 'Track 15 different habits',
        icon: '🌈',
        unlocked: false,
        progress: 0,
        threshold: 15
      },
      {
        id: 'twenty-habits',
        title: 'Habit Virtuoso',
        description: 'Track 20 different habits',
        icon: '🎭',
        unlocked: false,
        progress: 0,
        threshold: 20
      },
      {
        id: 'twenty-five-habits',
        title: 'Habit Maestro',
        description: 'Track 25 different habits',
        icon: '🎻',
        unlocked: false,
        progress: 0,
        threshold: 25
      },
      {
        id: 'habit-hat-trick',
        title: 'Hat Trick',
        description: 'Complete 3 habits in a single day',
        icon: '🎩',
        unlocked: false,
        progress: 0,
        threshold: 3
      },
      {
        id: 'habit-grand-slam',
        title: 'Grand Slam',
        description: 'Complete 5 habits in a single day',
        icon: '🏏',
        unlocked: false,
        progress: 0,
        threshold: 5
      },
      {
        id: 'habit-perfect-ten',
        title: 'Perfect 10',
        description: 'Complete 10 habits in a single day',
        icon: '💯',
        unlocked: false,
        progress: 0,
        threshold: 10
      },
      {
        id: 'hundred-completions',
        title: 'Century Milestone',
        description: 'Complete habits 100 times in total',
        icon: '🏁',
        unlocked: false,
        progress: 0,
        threshold: 100
      },
      {
        id: 'five-hundred-completions',
        title: '500 Club',
        description: 'Complete habits 500 times in total',
        icon: '🔔',
        unlocked: false,
        progress: 0,
        threshold: 500
      },
      {
        id: 'thousand-completions',
        title: 'Millennial Milestone',
        description: 'Complete habits 1000 times in total',
        icon: '🎖️',
        unlocked: false,
        progress: 0,
        threshold: 1000
      },
      {
        id: 'hour-focus',
        title: 'Hour of Power',
        description: 'Complete a single focus session of at least 60 minutes',
        icon: '⏱️',
        unlocked: false
      },
      {
        id: 'two-hour-focus',
        title: 'Deep Dive',
        description: 'Complete a single focus session of at least 120 minutes',
        icon: '⏳',
        unlocked: false
      },
      {
        id: 'daily-double',
        title: 'Daily Double',
        description: 'Complete 2 focus sessions in a single day',
        icon: '📚',
        unlocked: false,
        progress: 0,
        threshold: 2
      },
      {
        id: 'triple-focus',
        title: 'Triple Focus',
        description: 'Complete 3 focus sessions in a single day',
        icon: '🎯',
        unlocked: false,
        progress: 0,
        threshold: 3
      },
      {
        id: 'five-hour-day',
        title: 'Five Hour Legend',
        description: 'Accumulate 5 hours of focus time in a single day',
        icon: '🕓',
        unlocked: false,
        progress: 0,
        threshold: 300
      },
      {
        id: 'ten-hour-week',
        title: 'Productive Week',
        description: 'Accumulate 10 hours of focus time in a week',
        icon: '📅',
        unlocked: false,
        progress: 0,
        threshold: 600
      },
      {
        id: 'forty-hour-month',
        title: 'Full-Time Focus',
        description: 'Accumulate 40 hours of focus time in a month',
        icon: '👨‍💻',
        unlocked: false,
        progress: 0,
        threshold: 2400
      },
      {
        id: 'twenty-calendar-events',
        title: 'Calendar Connoisseur',
        description: 'Create 20 calendar events',
        icon: '📆',
        unlocked: false,
        progress: 0,
        threshold: 20
      },
      {
        id: 'fifty-calendar-events',
        title: 'Schedule Savant',
        description: 'Create 50 calendar events',
        icon: '🗓️',
        unlocked: false,
        progress: 0,
        threshold: 50
      },
      {
        id: 'completed-calendar-event',
        title: 'On Schedule',
        description: 'Complete your first scheduled event',
        icon: '✓',
        unlocked: false
      },
      {
        id: 'ten-completed-events',
        title: 'Reliability Expert',
        description: 'Complete 10 scheduled events',
        icon: '📌',
        unlocked: false,
        progress: 0,
        threshold: 10
      },
      {
        id: 'month-planned',
        title: 'Forward Thinker',
        description: 'Plan events spanning at least 30 days in the future',
        icon: '📈',
        unlocked: false
      },
      {
        id: 'hundred-tasks-completed',
        title: 'Task Master',
        description: 'Complete 100 tasks',
        icon: '📋',
        unlocked: false,
        progress: 0,
        threshold: 100
      },
      {
        id: 'five-hundred-tasks',
        title: 'Task Legend',
        description: 'Complete 500 tasks',
        icon: '📑',
        unlocked: false,
        progress: 0,
        threshold: 500
      },
      {
        id: 'five-tasks-day',
        title: 'Efficient Day',
        description: 'Complete 5 tasks in a single day',
        icon: '⚡',
        unlocked: false,
        progress: 0,
        threshold: 5
      },
      {
        id: 'ten-tasks-day',
        title: 'Productivity Beast',
        description: 'Complete 10 tasks in a single day',
        icon: '🔋',
        unlocked: false,
        progress: 0,
        threshold: 10
      },
      {
        id: 'twenty-tasks-week',
        title: 'Weekly Warrior',
        description: 'Complete 20 tasks in a single week',
        icon: '📊',
        unlocked: false,
        progress: 0,
        threshold: 20
      },
      {
        id: 'first-high-priority',
        title: 'Prioritizer',
        description: 'Complete your first high-priority task',
        icon: '🚨',
        unlocked: false
      },
      {
        id: 'all-priorities-day',
        title: 'Balance Master',
        description: 'Complete tasks of all priority levels in a single day',
        icon: '⚖️',
        unlocked: false
      },
      {
        id: 'morning-routine-master',
        title: 'Morning Routine Master',
        description: 'Complete 20 habits before 9 AM',
        icon: '☀️',
        unlocked: false,
        progress: 0,
        threshold: 20
      },
      {
        id: 'night-owl-master',
        title: 'Night Owl Master',
        description: 'Complete 20 habits after 9 PM',
        icon: '🦉',
        unlocked: false,
        progress: 0,
        threshold: 20
      },
      {
        id: 'lunch-break-champion',
        title: 'Lunch Break Champion',
        description: 'Complete 10 habits between 12 PM and 2 PM',
        icon: '🍱',
        unlocked: false,
        progress: 0,
        threshold: 10
      },
      {
        id: 'first-quarter',
        title: 'First Quarter',
        description: 'Use the app for 90 consecutive days',
        icon: '🌓',
        unlocked: false,
        progress: 0,
        threshold: 90
      },
      {
        id: 'half-year-commitment',
        title: 'Half-Year Commitment',
        description: 'Use the app for 180 consecutive days',
        icon: '🌗',
        unlocked: false,
        progress: 0,
        threshold: 180
      },
      {
        id: 'full-year-dedication',
        title: 'Full Year Dedication',
        description: 'Use the app for 365 consecutive days',
        icon: '🌕',
        unlocked: false,
        progress: 0,
        threshold: 365
      },
      {
        id: 'daily-login-streak',
        title: 'Login Streak',
        description: 'Log in to the app for 10 consecutive days',
        icon: '🔑',
        unlocked: false,
        progress: 0,
        threshold: 10
      },
      {
        id: 'all-themes',
        title: 'Theme Collector',
        description: 'Try all available themes',
        icon: '🎭',
        unlocked: false,
        progress: 0,
        threshold: 4
      },
      {
        id: 'custom-profile',
        title: 'Personal Touch',
        description: 'Customize your profile with a display name',
        icon: '👤',
        unlocked: false
      },
      {
        id: 'first-goal',
        title: 'Goal Setter',
        description: 'Set your first personal goal',
        icon: '🏁',
        unlocked: false
      },
      {
        id: 'five-goals',
        title: 'Goal Enthusiast',
        description: 'Set 5 personal goals',
        icon: '🎯',
        unlocked: false,
        progress: 0,
        threshold: 5
      },
      {
        id: 'first-soundscape',
        title: 'Sound Explorer',
        description: 'Try your first soundscape during a focus session',
        icon: '🎵',
        unlocked: false
      },
      {
        id: 'all-soundscapes',
        title: 'Sonic Connoisseur',
        description: 'Try all available soundscapes',
        icon: '🎧',
        unlocked: false
      },
      {
        id: 'background-changer',
        title: 'Environment Designer',
        description: 'Change your background theme',
        icon: '🖼️',
        unlocked: false
      },
      {
        id: 'analytics-explorer',
        title: 'Data Diver',
        description: 'View your analytics page 5 times',
        icon: '📊',
        unlocked: false,
        progress: 0,
        threshold: 5
      },
      {
        id: 'assistant-chat',
        title: 'Friendly Conversation',
        description: 'Chat with the Focus Assistant',
        icon: '💬',
        unlocked: false
      },
      {
        id: 'ten-assistant-chats',
        title: 'Deep Conversation',
        description: 'Chat with the Focus Assistant 10 times',
        icon: '🤖',
        unlocked: false,
        progress: 0,
        threshold: 10
      },
      {
        id: 'feedback-provider',
        title: 'Helpful Feedback',
        description: 'Provide feedback after 5 focus sessions',
        icon: '📝',
        unlocked: false,
        progress: 0,
        threshold: 5
      },
      {
        id: 'feature-explorer',
        title: 'Feature Fanatic',
        description: 'Use all main features of the app',
        icon: '🔍',
        unlocked: false
      },
      {
        id: 'holiday-focus',
        title: 'Holiday Hustler',
        description: 'Complete a focus session on a major holiday',
        icon: '🎄',
        unlocked: false
      },
      {
        id: 'midnight-oil',
        title: 'Midnight Oil',
        description: 'Complete a focus session that spans midnight',
        icon: '🕛',
        unlocked: false
      },
      {
        id: 'weekend-focus',
        title: 'Weekend Warrior',
        description: 'Complete 5 focus sessions on weekends',
        icon: '🏋️‍♂️',
        unlocked: false,
        progress: 0,
        threshold: 5
      },
      {
        id: 'first-milestone',
        title: 'First Milestone',
        description: 'Reach your first habit goal duration',
        icon: '🏆',
        unlocked: false
      },
      {
        id: 'five-milestones',
        title: 'Milestone Master',
        description: 'Complete 5 habit goal durations',
        icon: '🎖️',
        unlocked: false,
        progress: 0,
        threshold: 5
      },
      {
        id: 'comeback-kid',
        title: 'Comeback Kid',
        description: 'Resume a habit after a 7+ day break',
        icon: '🔄',
        unlocked: false
      },
      {
        id: 'achievement-hunter',
        title: 'Achievement Hunter',
        description: 'Unlock 10 achievements',
        icon: '🎯',
        unlocked: false,
        progress: 0,
        threshold: 10
      },
      {
        id: 'achievement-collector',
        title: 'Achievement Collector',
        description: 'Unlock 25 achievements',
        icon: '🏅',
        unlocked: false,
        progress: 0,
        threshold: 25
      },
      {
        id: 'achievement-master',
        title: 'Achievement Master',
        description: 'Unlock 50 achievements',
        icon: '👑',
        unlocked: false,
        progress: 0,
        threshold: 50
      }
    ];

    AchievementService.saveAchievements(defaultAchievements);
    return defaultAchievements;
  },

  unlockAchievement: (id: string): Achievement | null => {
    const achievements = AchievementService.getAchievements();
    const index = achievements.findIndex(a => a.id === id);

    if (index !== -1 && !achievements[index].unlocked) {
      achievements[index].unlocked = true;
      achievements[index].date = new Date().toISOString();
      AchievementService.saveAchievements(achievements);
      return achievements[index];
    }

    return null;
  },

  updateAchievementProgress: (id: string, progress: number): Achievement | null => {
    const achievements = AchievementService.getAchievements();
    const index = achievements.findIndex(a => a.id === id);

    if (index !== -1) {
      const achievement = achievements[index];
      achievement.progress = progress;

      if (achievement.threshold && progress >= achievement.threshold && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.date = new Date().toISOString();
      }

      achievements[index] = achievement;
      AchievementService.saveAchievements(achievements);
      return achievement;
    }

    return null;
  },

  checkForNewAchievements: (): Achievement | null => {
    const habits = HabitService.getHabits();
    const events = EventService.getEvents();
    const sessions = SessionService.getSessions();
    const tasks = TaskService.getTasks();
    const settings = SettingsService.getSettings();
    const achievements = AchievementService.getAchievements();
    let unlockedAchievement: Achievement | null = null;

    // First habit
    const firstHabitAchievement = achievements.find(a => a.id === 'first-habit');
    if (firstHabitAchievement && !firstHabitAchievement.unlocked && habits.length > 0) {
      unlockedAchievement = AchievementService.unlockAchievement('first-habit');
    }

    // Habits count achievements
    const habitCountAchievements = [
      { id: 'five-habits', threshold: 5 },
      { id: 'ten-habits', threshold: 10 },
      { id: 'fifteen-habits', threshold: 15 },
      { id: 'twenty-habits', threshold: 20 },
      { id: 'twenty-five-habits', threshold: 25 }
    ];

    habitCountAchievements.forEach(({ id, threshold }) => {
      const achievement = achievements.find(a => a.id === id);
      if (achievement) {
        AchievementService.updateAchievementProgress(id, habits.length);
        if (!achievement.unlocked && habits.length >= threshold) {
          unlockedAchievement = AchievementService.unlockAchievement(id);
        }
      }
    });

    // Streak achievements - single habit
    const maxStreak = Math.max(...habits.map(h => h.streak), 0);
    const streakAchievements = [
      { id: 'three-day-streak', threshold: 3 },
      { id: 'seven-day-streak', threshold: 7 },
      { id: 'fourteen-day-streak', threshold: 14 },
      { id: 'thirty-day-streak', threshold: 30 },
      { id: 'sixty-day-streak', threshold: 60 },
      { id: 'ninety-day-streak', threshold: 90 },
      { id: 'hundred-day-streak', threshold: 100 },
      { id: 'six-month-streak', threshold: 180 },
      { id: 'year-streak', threshold: 365 }
    ];

    streakAchievements.forEach(({ id, threshold }) => {
      const achievement = achievements.find(a => a.id === id);
      if (achievement) {
        AchievementService.updateAchievementProgress(id, maxStreak);
        if (!achievement.unlocked && maxStreak >= threshold) {
          unlockedAchievement = AchievementService.unlockAchievement(id);
        }
      }
    });

    // Multiple habits with streaks
    const habitsWithStreakOfSeven = habits.filter(h => h.streak >= 7).length;
    const multiStreakAchievements = [
      { id: 'three-habits-streak', threshold: 3 },
      { id: 'five-habits-streak', threshold: 5 }
    ];

    multiStreakAchievements.forEach(({ id, threshold }) => {
      const achievement = achievements.find(a => a.id === id);
      if (achievement) {
        AchievementService.updateAchievementProgress(id, habitsWithStreakOfSeven);
        if (!achievement.unlocked && habitsWithStreakOfSeven >= threshold) {
          unlockedAchievement = AchievementService.unlockAchievement(id);
        }
      }
    });

    // Calendar events achievements
    const calendarEventAchievements = [
      { id: 'first-calendar-event', threshold: 1 },
      { id: 'five-calendar-events', threshold: 5 },
      { id: 'ten-calendar-events', threshold: 10 },
      { id: 'twenty-calendar-events', threshold: 20 },
      { id: 'fifty-calendar-events', threshold: 50 }
    ];

    calendarEventAchievements.forEach(({ id, threshold }) => {
      const achievement = achievements.find(a => a.id === id);
      if (achievement) {
        if (id === 'first-calendar-event') {
          if (!achievement.unlocked && events.length > 0) {
            unlockedAchievement = AchievementService.unlockAchievement(id);
          }
        } else {
          AchievementService.updateAchievementProgress(id, events.length);
          if (!achievement.unlocked && events.length >= threshold) {
            unlockedAchievement = AchievementService.unlockAchievement(id);
          }
        }
      }
    });

    // Completed calendar events
    const completedEvents = events.filter(e => e.completed).length;
    const completedEventAchievements = [
      { id: 'completed-calendar-event', threshold: 1 },
      { id: 'ten-completed-events', threshold: 10 }
    ];

    completedEventAchievements.forEach(({ id, threshold }) => {
      const achievement = achievements.find(a => a.id === id);
      if (achievement) {
        if (id === 'completed-calendar-event') {
          if (!achievement.unlocked && completedEvents > 0) {
            unlockedAchievement = AchievementService.unlockAchievement(id);
          }
        } else {
          AchievementService.updateAchievementProgress(id, completedEvents);
          if (!achievement.unlocked && completedEvents >= threshold) {
            unlockedAchievement = AchievementService.unlockAchievement(id);
          }
        }
      }
    });

    // Focus session achievements
    const completedSessions = sessions.filter(s => s.completed).length;
    const focusSessionAchievements = [
      { id: 'five-focus-sessions', threshold: 5 },
      { id: 'ten-focus-sessions', threshold: 10 },
      { id: 'twenty-five-focus-sessions', threshold: 25 },
      { id: 'fifty-focus-sessions', threshold: 50 },
      { id: 'hundred-focus-sessions', threshold: 100 }
    ];

    focusSessionAchievements.forEach(({ id, threshold }) => {
      const achievement = achievements.find(a => a.id === id);
      if (achievement) {
        AchievementService.updateAchievementProgress(id, completedSessions);
        if (!achievement.unlocked && completedSessions >= threshold) {
          unlockedAchievement = AchievementService.unlockAchievement(id);
        }
      }
    });

    // Hour-based focus achievements
    const longFocusSessions = sessions.filter(s => s.completed && s.duration >= 3600).length; // 60 min sessions
    const twoHourFocusSessions = sessions.filter(s => s.completed && s.duration >= 7200).length; // 120 min sessions
    
    const hourFocusAchievement = achievements.find(a => a.id === 'hour-focus');
    if (hourFocusAchievement && !hourFocusAchievement.unlocked && longFocusSessions > 0) {
      unlockedAchievement = AchievementService.unlockAchievement('hour-focus');
    }
    
    const twoHourFocusAchievement = achievements.find(a => a.id === 'two-hour-focus');
    if (twoHourFocusAchievement && !twoHourFocusAchievement.unlocked && twoHourFocusSessions > 0) {
      unlockedAchievement = AchievementService.unlockAchievement('two-hour-focus');
    }

    // Task achievements
    const firstTaskAchievement = achievements.find(a => a.id === 'first-task');
    if (firstTaskAchievement && !firstTaskAchievement.unlocked && tasks.length > 0) {
      unlockedAchievement = AchievementService.unlockAchievement('first-task');
    }

    const completedTasks = tasks.filter(t => t.completed).length;
    const taskAchievements = [
      { id: 'ten-tasks-completed', threshold: 10 },
      { id: 'fifty-tasks-completed', threshold: 50 },
      { id: 'hundred-tasks-completed', threshold: 100 },
      { id: 'five-hundred-tasks', threshold: 500 }
    ];

    taskAchievements.forEach(({ id, threshold }) => {
      const achievement = achievements.find(a => a.id === id);
      if (achievement) {
        AchievementService.updateAchievementProgress(id, completedTasks);
        if (!achievement.unlocked && completedTasks >= threshold) {
          unlockedAchievement = AchievementService.unlockAchievement(id);
        }
      }
    });

    // High-priority task achievement
    const highPriorityCompleted = tasks.filter(t => t.completed && t.priority === 'high').length;
    const highPriorityAchievement = achievements.find(a => a.id === 'first-high-priority');
    if (highPriorityAchievement && !highPriorityAchievement.unlocked && highPriorityCompleted > 0) {
      unlockedAchievement = AchievementService.unlockAchievement('first-high-priority');
    }

    // Daily habit completions - can use completion history from each habit
    // This would need to count completions per day to award these achievements
    // For demo purposes, we can check if any habits have been completed today
    const today = new Date().toISOString().split('T')[0];
    let habitsCompletedToday = 0;
    habits.forEach(habit => {
      if (habit.completionHistory[today]) {
        habitsCompletedToday++;
      }
    });

    const dailyHabitAchievements = [
      { id: 'habit-hat-trick', threshold: 3 },
      { id: 'habit-grand-slam', threshold: 5 },
      { id: 'habit-perfect-ten', threshold: 10 }
    ];

    dailyHabitAchievements.forEach(({ id, threshold }) => {
      const achievement = achievements.find(a => a.id === id);
      if (achievement) {
        AchievementService.updateAchievementProgress(id, habitsCompletedToday);
        if (!achievement.unlocked && habitsCompletedToday >= threshold) {
          unlockedAchievement = AchievementService.unlockAchievement(id);
        }
      }
    });

    // Total habit completions - sum up all completions from all habits
    let totalCompletions = 0;
    habits.forEach(habit => {
      totalCompletions += Object.values(habit.completionHistory).filter(completed => completed).length;
    });

    const totalCompletionAchievements = [
      { id: 'hundred-completions', threshold: 100 },
      { id: 'five-hundred-completions', threshold: 500 },
      { id: 'thousand-completions', threshold: 1000 }
    ];

    totalCompletionAchievements.forEach(({ id, threshold }) => {
      const achievement = achievements.find(a => a.id === id);
      if (achievement) {
        AchievementService.updateAchievementProgress(id, totalCompletions);
        if (!achievement.unlocked && totalCompletions >= threshold) {
          unlockedAchievement = AchievementService.unlockAchievement(id);
        }
      }
    });

    // Check for goal-related achievements
    const goals = localStorage.getItem('focus-ritual-goals');
    const parsedGoals = goals ? JSON.parse(goals) : [];
    
    const firstGoalAchievement = achievements.find(a => a.id === 'first-goal');
    if (firstGoalAchievement && !firstGoalAchievement.unlocked && parsedGoals.length > 0) {
      unlockedAchievement = AchievementService.unlockAchievement('first-goal');
    }
    
    const fiveGoalsAchievement = achievements.find(a => a.id === 'five-goals');
    if (fiveGoalsAchievement) {
      AchievementService.updateAchievementProgress('five-goals', parsedGoals.length);
      if (!fiveGoalsAchievement.unlocked && parsedGoals.length >= 5) {
        unlockedAchievement = AchievementService.unlockAchievement('five-goals');
      }
    }

    // Check for first milestone achievement (habit goal duration reached)
    const habitsWithCompletedGoals = habits.filter(h => h.goalCompleted).length;
    
    const firstMilestoneAchievement = achievements.find(a => a.id === 'first-milestone');
    if (firstMilestoneAchievement && !firstMilestoneAchievement.unlocked && habitsWithCompletedGoals > 0) {
      unlockedAchievement = AchievementService.unlockAchievement('first-milestone');
    }
    
    const fiveMilestonesAchievement = achievements.find(a => a.id === 'five-milestones');
    if (fiveMilestonesAchievement) {
      AchievementService.updateAchievementProgress('five-milestones', habitsWithCompletedGoals);
      if (!fiveMilestonesAchievement.unlocked && habitsWithCompletedGoals >= 5) {
        unlockedAchievement = AchievementService.unlockAchievement('five-milestones');
      }
    }

    // Achievement tracking - meta achievements for unlocking other achievements
    const unlockedAchievementsCount = achievements.filter(a => a.unlocked).length;
    
    const achievementTrackerAchievements = [
      { id: 'achievement-hunter', threshold: 10 },
      { id: 'achievement-collector', threshold: 25 },
      { id: 'achievement-master', threshold: 50 }
    ];
    
    achievementTrackerAchievements.forEach(({ id, threshold }) => {
      const achievement = achievements.find(a => a.id === id);
      if (achievement) {
        AchievementService.updateAchievementProgress(id, unlockedAchievementsCount);
        if (!achievement.unlocked && unlockedAchievementsCount >= threshold) {
          unlockedAchievement = AchievementService.unlockAchievement(id);
        }
      }
    });

    return unlockedAchievement;
  }
};

// Settings Service
export const SettingsService = {
  getSettings: (): UserSettings => {
    return safeStorage.get<UserSettings>(STORAGE_KEYS.SETTINGS, {
      theme: 'default',
      soundEnabled: true,
      notificationsEnabled: true
    });
  },

  saveSettings: (settings: UserSettings): void => {
    safeStorage.set(STORAGE_KEYS.SETTINGS, settings);
  },

  updateSettings: (updates: Partial<UserSettings>): UserSettings => {
    const currentSettings = SettingsService.getSettings();
    const updatedSettings = { ...currentSettings, ...updates };
    SettingsService.saveSettings(updatedSettings);
    return updatedSettings;
  }
};

// Session History Service
export interface FocusSession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
  completed: boolean;
  feedback?: {
    productivity: number;
    distractions: number;
    mood: number;
    notes?: string;
  };
}

export const SessionService = {
  getSessions: (): FocusSession[] => {
    return safeStorage.get<FocusSession[]>(STORAGE_KEYS.SESSION_HISTORY, []);
  },

  saveSessions: (sessions: FocusSession[]): void => {
    safeStorage.set(STORAGE_KEYS.SESSION_HISTORY, sessions);
  },

  addSession: (session: Omit<FocusSession, 'id'>): FocusSession => {
    const sessions = SessionService.getSessions();
    const newSession: FocusSession = {
      id: uuidv4(),
      ...session
    };

    sessions.push(newSession);
    SessionService.saveSessions(sessions);
    return newSession;
  },

  updateSession: (updatedSession: FocusSession): FocusSession => {
    const sessions = SessionService.getSessions();
    const index = sessions.findIndex(s => s.id === updatedSession.id);

    if (index !== -1) {
      sessions[index] = updatedSession;
      SessionService.saveSessions(sessions);
    }

    return updatedSession;
  },

  getSessionStats: () => {
    const sessions = SessionService.getSessions();
    const completedSessions = sessions.filter(s => s.completed);

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      totalFocusTime: completedSessions.reduce((sum, s) => sum + s.duration, 0),
      averageProductivity: completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => sum + (s.feedback?.productivity || 0), 0) / completedSessions.length
        : 0
    };
  }
};

// Task Service
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string;
}

export const TaskService = {
  getTasks: (): Task[] => {
    return safeStorage.get<Task[]>(STORAGE_KEYS.TASKS, []);
  },

  saveTasks: (tasks: Task[]): void => {
    safeStorage.set(STORAGE_KEYS.TASKS, tasks);
  },

  addTask: (task: Omit<Task, 'id' | 'createdAt'>): Task => {
    const tasks = TaskService.getTasks();
    const newTask: Task = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...task
    };

    tasks.push(newTask);
    TaskService.saveTasks(tasks);
    return newTask;
  },

  updateTask: (updatedTask: Task): Task => {
    const tasks = TaskService.getTasks();
    const index = tasks.findIndex(t => t.id === updatedTask.id);

    if (index !== -1) {
      tasks[index] = updatedTask;
      TaskService.saveTasks(tasks);
    }

    return updatedTask;
  },

  deleteTask: (id: string): void => {
    const tasks = TaskService.getTasks();
    const filteredTasks = tasks.filter(t => t.id !== id);
    TaskService.saveTasks(filteredTasks);
  },

  toggleTaskCompletion: (id: string): Task | null => {
    const tasks = TaskService.getTasks();
    const index = tasks.findIndex(t => t.id === id);

    if (index !== -1) {
      const task = tasks[index];
      task.completed = !task.completed;
      tasks[index] = task;
      TaskService.saveTasks(tasks);
      return task;
    }

    return null;
  }
};

// Export a unified data service
const DataService = {
  Habits: HabitService,
  Events: EventService,
  Achievements: AchievementService,
  Settings: SettingsService,
  Sessions: SessionService,
  Tasks: TaskService
};

export default DataService; 