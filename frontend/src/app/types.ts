export interface Exam {
  id: string | number | null;
  subjectName: string;
  examDate: string;
  examTime: string;
  location?: string;
  notes?: string;
}

export interface RawWeeklyProgressItem {
  date: string;
  totalMinutes: number;
}

export interface WeeklyProgressItem {
  day: string;
  minutes: number;
}

export interface PomodoroSession {
  id: string;
  userId: string;
  mode: PomodoroMode;
  durationMinutes: number;
  subject: string;
  completed: boolean;
  completedAt: string;
  createdAt: string;
}

export enum PomodoroMode {
  FOCUS,
  SHORT_BREAK,
  LONG_BREAK,
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  repetition: number;
  easiness: number;
  nextReview: string; // ISO date YYYY-MM-DD
}
