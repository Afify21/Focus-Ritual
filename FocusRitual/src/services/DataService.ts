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
  
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completionHistory'>): Habit => {
    const habits = HabitService.getHabits();
    const newHabit: Habit = {
      id: uuidv4(),
      ...habit,
      streak: 0,
      completionHistory: {},
      createdAt: new Date().toISOString()
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
        id: 'five-habits',
        title: 'Habit Collector',
        description: 'Track 5 different habits',
        icon: '🌟',
        unlocked: false,
        progress: 0,
        threshold: 5
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
        id: 'first-calendar-event',
        title: 'Planning Ahead',
        description: 'Create your first calendar event',
        icon: '📅',
        unlocked: false
      },
      {
        id: 'ten-focus-sessions',
        title: 'Focus Master',
        description: 'Complete 10 focus sessions',
        icon: '🧠',
        unlocked: false,
        progress: 0,
        threshold: 10
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
    const achievements = AchievementService.getAchievements();
    let unlockedAchievement: Achievement | null = null;
    
    // First habit
    const firstHabitAchievement = achievements.find(a => a.id === 'first-habit');
    if (firstHabitAchievement && !firstHabitAchievement.unlocked && habits.length > 0) {
      unlockedAchievement = AchievementService.unlockAchievement('first-habit');
    }
    
    // Five habits
    const fiveHabitsAchievement = achievements.find(a => a.id === 'five-habits');
    if (fiveHabitsAchievement) {
      AchievementService.updateAchievementProgress('five-habits', habits.length);
      if (!fiveHabitsAchievement.unlocked && habits.length >= 5) {
        unlockedAchievement = AchievementService.unlockAchievement('five-habits');
      }
    }
    
    // Streak achievements
    const maxStreak = Math.max(...habits.map(h => h.streak), 0);
    
    // 3-day streak
    const threeDayStreakAchievement = achievements.find(a => a.id === 'three-day-streak');
    if (threeDayStreakAchievement) {
      AchievementService.updateAchievementProgress('three-day-streak', maxStreak);
      if (!threeDayStreakAchievement.unlocked && maxStreak >= 3) {
        unlockedAchievement = AchievementService.unlockAchievement('three-day-streak');
      }
    }
    
    // 7-day streak
    const sevenDayStreakAchievement = achievements.find(a => a.id === 'seven-day-streak');
    if (sevenDayStreakAchievement) {
      AchievementService.updateAchievementProgress('seven-day-streak', maxStreak);
      if (!sevenDayStreakAchievement.unlocked && maxStreak >= 7) {
        unlockedAchievement = AchievementService.unlockAchievement('seven-day-streak');
      }
    }
    
    // First calendar event
    const firstCalendarEventAchievement = achievements.find(a => a.id === 'first-calendar-event');
    if (firstCalendarEventAchievement && !firstCalendarEventAchievement.unlocked && events.length > 0) {
      unlockedAchievement = AchievementService.unlockAchievement('first-calendar-event');
    }
    
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