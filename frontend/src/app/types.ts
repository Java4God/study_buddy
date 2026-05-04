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
