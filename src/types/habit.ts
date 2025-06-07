export interface Habit {
  id: string;
  name: string;
  category: string;
  streak: number;
  goalDuration: number; // Number of days for the goal
  goalCompleted: boolean; // Whether the goal has been achieved
  goalCompletedAt?: string; // When the goal was completed
  completionHistory: {
    [date: string]: boolean;
  };
} 