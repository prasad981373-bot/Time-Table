import React, { useState } from 'react';
import { TimetableEntry, DayOfWeek, AttendanceStatus } from '../types';
import { 
  timeToMinutes, 
  formatTimeDisplay, 
  formatDuration, 
  getColorScheme, 
  getCurrentMinutesFromMidnight,
  getLiveStatus
} from '../utils/timeUtils';
import { 
  Clock, 
  MapPin, 
  User, 
  CheckCircle, 
  Play, 
  ExternalLink, 
  Calendar, 
  BookOpen, 
  AlertCircle,
  Plus
} from 'lucide-react';

interface DailyAgendaViewProps {
  entries: TimetableEntry[];
  currentDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  onSelectEntry: (entry: TimetableEntry) => void;
  onStartFocusSession: (subjectName: string, subjectCode: string) => void;
  onAddClass: () => void;
  studentName?: string;
}

export const DailyAgendaView: React.FC<DailyAgendaViewProps> = ({
  entries,
  currentDay,
  onSelectDay,
  onSelectEntry,
  onStartFocusSession,
  onAddClass,
  studentName = 'Prasad',
}) => {
  const currentMinutes = getCurrentMinutesFromMidnight();
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});

  const toggleAttendance = (id: string, current: AttendanceStatus) => {
    const next: AttendanceStatus = current === 'attended' ? 'upcoming' : 'attended';
    setAttendanceMap((prev) => ({ ...prev, [id]: next }));
  };

  const { todayEntries, currentClass, nextClass } = getLiveStatus(entries, currentDay, currentMinutes);

  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Current class progress
  let currentClassProgress = 0;
  let minutesLeftInCurrent = 0;
  if (currentClass) {
    const s = timeToMinutes(currentClass.startTime);
    const e = timeToMinutes(currentClass.endTime);
    currentClassProgress = Math.min(100, Math.max(0, ((currentMinutes - s) / (e - s)) * 100));
    minutesLeftInCurrent = Math.max(0, e - currentMinutes);
  }

  // Next class countdown
  let minutesUntilNext = 0;
  if (nextClass) {
    const nextStart = timeToMinutes(nextClass.startTime);
    minutesUntilNext = Math.max(0, nextStart - currentMinutes);
  }

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Day Selector Pill Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-between gap-1 overflow-x-auto shadow-xs no-print">
        {days.map((day) => {
          const isSelected = day === currentDay;
          const dayCount = entries.filter((e) => e.day === day).length;
          return (
            <button
              key={day}
              onClick={() => onSelectDay(day)}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors text-center whitespace-nowrap min-w-[90px] ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div>{day.slice(0, 3)}</div>
              <div className={`text-[10px] font-mono mt-0.5 tabular-nums ${
                isSelected ? 'text-slate-300' : 'text-slate-400'
              }`}>
                {dayCount} {dayCount === 1 ? 'class' : 'classes'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Status Hero Banner */}
      {currentClass ? (
        <div className="bg-white border-2 border-indigo-500/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                <span>Happening Right Now</span>
                <span className="text-slate-400 font-mono">·</span>
                <span className="font-mono tabular-nums">{minutesLeftInCurrent}m remaining</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {currentClass.subjectName}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1.5 font-medium">
                <span className="font-mono text-slate-900">{currentClass.subjectCode}</span>
                <span>·</span>
                <span>{currentClass.type}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {currentClass.room || 'Campus Room'}
                </span>
                {currentClass.instructor && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {currentClass.instructor}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onStartFocusSession(currentClass.subjectName, currentClass.subjectCode)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Focus Timer</span>
              </button>
              {currentClass.link && (
                <a
                  href={currentClass.link}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
                  title="Open Class Portal / Meeting"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${currentClassProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1.5 tabular-nums">
              <span>{formatTimeDisplay(currentClass.startTime)}</span>
              <span>{formatTimeDisplay(currentClass.endTime)}</span>
            </div>
          </div>
        </div>
      ) : nextClass ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">
                Next up in <span className="font-mono font-bold text-slate-900 tabular-nums">{minutesUntilNext} minutes</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {nextClass.subjectName}
              </h3>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>{nextClass.subjectCode}</span>
                <span>·</span>
                <span>{formatTimeDisplay(nextClass.startTime)}</span>
                <span>·</span>
                <span>{nextClass.room}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onStartFocusSession(nextClass.subjectName, nextClass.subjectCode)}
            className="px-3.5 py-1.5 text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pre-Class Study</span>
          </button>
        </div>
      ) : todayEntries.length > 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">All classes completed for {currentDay}!</span>
            <span className="text-emerald-800 ml-1">Great job! Use this time for review or relaxation.</span>
          </div>
        </div>
      ) : null}

      {/* Daily Timeline List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {studentName}'s {currentDay} Schedule
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological agenda and attendance tracking
            </p>
          </div>

          <button
            onClick={onAddClass}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Class</span>
          </button>
        </div>

        {todayEntries.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-800">No classes scheduled for {currentDay}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Your schedule is completely clear on this day. Add a lecture or schedule a dedicated self-study block.
            </p>
            <button
              onClick={onAddClass}
              className="mt-4 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Add Class to {currentDay}
            </button>
          </div>
        ) : (
          <div className="relative pl-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 flex flex-col gap-4">
            {todayEntries.map((entry, idx) => {
              const startMins = timeToMinutes(entry.startTime);
              const endMins = timeToMinutes(entry.endTime);
              const duration = endMins - startMins;
              const isPast = currentMinutes > endMins;
              const isNow = currentMinutes >= startMins && currentMinutes < endMins;
              const color = getColorScheme(entry.color);
              const status = attendanceMap[entry.id] || (isPast ? 'attended' : 'upcoming');

              return (
                <div key={entry.id} className="relative group">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-6 top-4 w-3.5 h-3.5 rounded-full border-2 bg-white transition-colors ${
                      isNow
                        ? 'border-indigo-600 bg-indigo-600 ring-4 ring-indigo-100'
                        : isPast
                        ? 'border-slate-400 bg-slate-400'
                        : 'border-slate-300'
                    }`}
                  />

                  {/* Card */}
                  <div
                    className={`border rounded-xl p-4 transition-all hover:shadow-xs cursor-pointer ${
                      isNow
                        ? 'bg-indigo-50/40 border-indigo-200 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => onSelectEntry(entry)}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded font-mono"
                          style={{ backgroundColor: color.bg, color: color.text }}
                        >
                          {entry.subjectCode || 'CLASS'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          {entry.subjectName}
                        </h4>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500 font-medium">{entry.type}</span>
                      </div>

                      {/* Attendance Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAttendance(entry.id, status);
                        }}
                        className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                          status === 'attended'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <CheckCircle className={`w-3.5 h-3.5 ${status === 'attended' ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{status === 'attended' ? 'Attended' : 'Mark Attended'}</span>
                      </button>
                    </div>

                    {/* Metadata line */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1 font-mono font-medium text-slate-800 tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {formatTimeDisplay(entry.startTime)} – {formatTimeDisplay(entry.endTime)}
                        </span>
                        <span className="text-slate-400">({formatDuration(duration)})</span>
                      </div>

                      {entry.room && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{entry.room}</span>
                        </div>
                      )}

                      {entry.instructor && (
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{entry.instructor}</span>
                        </div>
                      )}
                    </div>

                    {/* Notes if any */}
                    {entry.notes && (
                      <p className="text-xs text-slate-500 mt-2 bg-slate-50 rounded-lg p-2 border border-slate-100">
                        {entry.notes}
                      </p>
                    )}

                    {/* Footer Actions */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartFocusSession(entry.subjectName, entry.subjectCode);
                        }}
                        className="text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Focus on this subject</span>
                      </button>

                      {entry.link && (
                        <a
                          href={entry.link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
                        >
                          <span>Resource Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
