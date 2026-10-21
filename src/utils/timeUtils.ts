import { DayOfWeek, TimetableEntry, ScheduleConflict } from '../types';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const WORKDAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

// Color palette specifically designed for clean visual distinction without harsh AI-neon
export const COLOR_OPTIONS = [
  { id: 'indigo', name: 'Indigo', bg: '#EEF2FF', text: '#3730A3', border: '#C7D2FE', accent: '#4F46E5' },
  { id: 'emerald', name: 'Emerald', bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0', accent: '#059669' },
  { id: 'amber', name: 'Amber', bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', accent: '#D97706' },
  { id: 'rose', name: 'Rose', bg: '#FFF1F2', text: '#9F1239', border: '#FECDD3', accent: '#E11D48' },
  { id: 'cyan', name: 'Cyan', bg: '#ECFEFF', text: '#155E75', border: '#A5F3FC', accent: '#0891B2' },
  { id: 'violet', name: 'Violet', bg: '#F5F3FF', text: '#5B21B6', border: '#DDD6FE', accent: '#7C3AED' },
  { id: 'slate', name: 'Slate', bg: '#F1F5F9', text: '#334155', border: '#CBD5E1', accent: '#475569' },
  { id: 'sky', name: 'Sky', bg: '#F0F9FF', text: '#075985', border: '#BAE6FD', accent: '#0284C7' },
];

export function getColorScheme(colorId: string) {
  const match = COLOR_OPTIONS.find((c) => c.id === colorId);
  return match || COLOR_OPTIONS[0];
}

/** Convert "HH:MM" (e.g. "09:30") to minutes from midnight */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

/** Convert minutes from midnight to "HH:MM" 24h format */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/** Format "09:30" or "14:15" to "9:30 AM" or "2:15 PM" */
export function formatTimeDisplay(timeStr: string, is12h = true): string {
  if (!timeStr) return '';
  if (!is12h) return timeStr;
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

/** Format duration in minutes into e.g. "1h 30m" or "45m" */
export function formatDuration(durationMinutes: number): string {
  if (durationMinutes < 60) {
    return `${durationMinutes}m`;
  }
  const h = Math.floor(durationMinutes / 60);
  const m = durationMinutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Get today's DayOfWeek in user's local timezone */
export function getCurrentDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const now = new Date();
  return days[now.getDay()];
}

/** Get current minutes from midnight */
export function getCurrentMinutesFromMidnight(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/** Check if two entries on the same day overlap */
export function checkOverlap(a: TimetableEntry, b: TimetableEntry): boolean {
  if (a.id === b.id || a.day !== b.day) return false;
  const aStart = timeToMinutes(a.startTime);
  const aEnd = timeToMinutes(a.endTime);
  const bStart = timeToMinutes(b.startTime);
  const bEnd = timeToMinutes(b.endTime);

  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

/** Find all conflicts in an array of entries */
export function findScheduleConflicts(entries: TimetableEntry[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];
      if (checkOverlap(a, b)) {
        const aStart = timeToMinutes(a.startTime);
        const aEnd = timeToMinutes(a.endTime);
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);
        const overlap = Math.min(aEnd, bEnd) - Math.max(aStart, bStart);
        conflicts.push({ entryA: a, entryB: b, overlapMinutes: overlap });
      }
    }
  }
  return conflicts;
}

/** Find what is happening right now today */
export function getLiveStatus(entries: TimetableEntry[], currentDay: DayOfWeek, currentMinutes: number) {
  const todayEntries = entries
    .filter((e) => e.day === currentDay)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const currentClass = todayEntries.find((e) => {
    const s = timeToMinutes(e.startTime);
    const end = timeToMinutes(e.endTime);
    return currentMinutes >= s && currentMinutes < end;
  });

  const nextClass = todayEntries.find((e) => {
    const s = timeToMinutes(e.startTime);
    return s > currentMinutes;
  });

  return {
    todayEntries,
    currentClass,
    nextClass,
  };
}

/** Play a gentle synthesized meditation chime via Web Audio API */
export function playFocusChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    // Harmonic frequencies for a calming Tibetan singing bowl tone
    const freqs = [528, 1056, 1584];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const peakGain = 0.15 / (idx + 1);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 3);
    });
  } catch {
    // Audio context may be restricted by autoplay policy; silent fallback
  }
}

/** Export timetable to standard iCalendar (.ics) format */
export function exportToICS(entries: TimetableEntry[], studentName: string): string {
  const dayIndexMap: Record<DayOfWeek, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const dayCodeMap: Record<DayOfWeek, string> = {
    Monday: 'MO',
    Tuesday: 'TU',
    Wednesday: 'WE',
    Thursday: 'TH',
    Friday: 'FR',
    Saturday: 'SA',
    Sunday: 'SU',
  };

  // Find next occurrence of each day starting from today
  const today = new Date();
  const currentDayIndex = today.getDay();

  const pad = (n: number) => n.toString().padStart(2, '0');

  let icsLines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Schedura Student Timetable//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${studentName || 'Student'} Class Schedule`,
    'X-WR-TIMEZONE:UTC',
  ];

  entries.forEach((entry) => {
    const targetDayIdx = dayIndexMap[entry.day];
    let dayDiff = targetDayIdx - currentDayIndex;
    if (dayDiff < 0) dayDiff += 7;

    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + dayDiff);

    const year = eventDate.getFullYear();
    const month = pad(eventDate.getMonth() + 1);
    const day = pad(eventDate.getDate());

    const [startH, startM] = entry.startTime.split(':');
    const [endH, endM] = entry.endTime.split(':');

    const dtStart = `${year}${month}${day}T${pad(parseInt(startH, 10))}${pad(parseInt(startM, 10))}00`;
    const dtEnd = `${year}${month}${day}T${pad(parseInt(endH, 10))}${pad(parseInt(endM, 10))}00`;
    const uid = `${entry.id}-${year}${month}${day}@schedura.app`;

    icsLines = icsLines.concat([
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${year}${month}${day}T000000Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${dayCodeMap[entry.day]}`,
      `SUMMARY:${entry.subjectCode ? `${entry.subjectCode}: ` : ''}${entry.subjectName} (${entry.type})`,
      `LOCATION:${entry.room || 'Campus'}`,
      `DESCRIPTION:${entry.instructor ? `Instructor: ${entry.instructor}\\n` : ''}${entry.notes || ''}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ]);
  });

  icsLines.push('END:VCALENDAR');
  return icsLines.join('\r\n');
}

/** Trigger download of a text/file in browser */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
