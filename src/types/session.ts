export interface FocusSession {
  id: string;
  startTime: string;
  duration: number;
  completed: boolean;
  feedback?: {
    productivity?: number;
    mood?: number;
    notes?: string;
  };
} 