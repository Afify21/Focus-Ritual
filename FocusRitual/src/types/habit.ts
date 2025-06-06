export interface Habit {
  id: string;
  name: string;
  category: string;
  streak: number;
  completionHistory: {
    [date: string]: boolean;
  };
} 