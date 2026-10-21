export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type ClassType = 
  | 'Lecture' 
  | 'Lab' 
  | 'Seminar' 
  | 'Tutorial' 
  | 'Workshop' 
  | 'Study Session' 
  | 'Office Hours';

export type AttendanceStatus = 'upcoming' | 'attended' | 'missed' | 'cancelled';

export interface TimetableEntry {
  id: string;
  subjectName: string;
  subjectCode: string; // e.g. "CS101", "MATH201"
  type: ClassType;
  day: DayOfWeek;
  startTime: string; // "09:00" in 24h format
  endTime: string;   // "10:30" in 24h format
  room: string;      // e.g. "Hall 302", "Science Lab B", "Zoom"
  instructor: string;
  color: string;     // color key or hex
  notes?: string;
  link?: string;     // syllabus, portal, zoom
  isStudySession?: boolean;
}

export interface StudySessionLog {
  id: string;
  subjectName: string;
  subjectCode: string;
  topic: string;
  timestamp: string; // ISO string
  durationMinutes: number;
  completed: boolean;
  notes?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  dueDate: string; // YYYY-MM-DD
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  notes?: string;
}

export interface StudentSettings {
  studentName: string;
  semester: string;
  weeklyStudyGoalHours: number;
  startHour: number; // e.g. 8 for 8 AM
  endHour: number;   // e.g. 21 for 9 PM
  showWeekend: boolean;
  timeFormat: '12h' | '24h';
}

export type ViewTab = 'weekly' | 'today' | 'timer' | 'planner' | 'assignments';

export interface ScheduleConflict {
  entryA: TimetableEntry;
  entryB: TimetableEntry;
  overlapMinutes: number;
}
