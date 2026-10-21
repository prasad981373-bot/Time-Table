import React from 'react';
import { TimetableEntry, DayOfWeek, ScheduleConflict } from '../types';
import { 
  DAYS_OF_WEEK, 
  WORKDAYS, 
  timeToMinutes, 
  formatTimeDisplay, 
  getColorScheme, 
  checkOverlap,
  getCurrentMinutesFromMidnight
} from '../utils/timeUtils';
import { MapPin, User, AlertCircle, ExternalLink, BookOpen, Clock } from 'lucide-react';

interface TimetableGridProps {
  entries: TimetableEntry[];
  showWeekend: boolean;
  onToggleWeekend: () => void;
  startHour: number;
  endHour: number;
  conflicts: ScheduleConflict[];
  currentDay: DayOfWeek;
  onSelectEntry: (entry: TimetableEntry) => void;
  onAddAtSlot: (day: DayOfWeek, time: string) => void;
  typeFilter: string;
  studentName?: string;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  entries,
  showWeekend,
  onToggleWeekend,
  startHour,
  endHour,
  conflicts,
  currentDay,
  onSelectEntry,
  onAddAtSlot,
  typeFilter,
  studentName = 'Prasad',
}) => {
  const visibleDays = showWeekend ? DAYS_OF_WEEK : WORKDAYS;
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const totalDayMinutes = (endHour - startHour) * 60;
  const currentMinutes = getCurrentMinutesFromMidnight();

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    if (typeFilter !== 'ALL' && entry.type !== typeFilter) return false;
    return true;
  });

  // Calculate current time line percentage if today is visible
  const isTimeInBounds = currentMinutes >= startHour * 60 && currentMinutes <= endHour * 60;
  const currentTimePercentage = isTimeInBounds
    ? ((currentMinutes - startHour * 60) / totalDayMinutes) * 100
    : -1;

  // Check if an entry is involved in any conflict
  const isConflicting = (entry: TimetableEntry) => {
    return conflicts.some((c) => c.entryA.id === entry.id || c.entryB.id === entry.id);
  };

  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col print-area">
      {/* Grid Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 no-print">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            {studentName}'s Weekly Schedule
          </h2>
          <span className="text-xs text-slate-500">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'event' : 'events'} shown
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showWeekend}
              onChange={onToggleWeekend}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
            />
            <span>Include Weekend</span>
          </label>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto flex-1 relative">
        <div className="min-w-[760px] select-none">
          {/* Day Headers */}
          <div className="grid grid-cols-[64px_repeat(var(--cols),_1fr)] border-b border-slate-200 sticky top-0 bg-white z-20"
               style={{ '--cols': visibleDays.length } as React.CSSProperties}>
            <div className="p-3 text-[11px] font-semibold text-slate-400 text-center border-r border-slate-100 flex items-center justify-center">
              Time
            </div>
            {visibleDays.map((day) => {
              const isToday = day === currentDay;
              const countForDay = filteredEntries.filter((e) => e.day === day).length;
              return (
                <div
                  key={day}
                  className={`p-3 text-center border-r border-slate-100 last:border-r-0 ${
                    isToday ? 'bg-indigo-50/60' : ''
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span className={`text-xs font-bold tracking-tight ${
                      isToday ? 'text-indigo-600' : 'text-slate-800'
                    }`}>
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-[10px] bg-indigo-600 text-white font-semibold px-1.5 py-0.2 rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5 tabular-nums">
                    {countForDay} {countForDay === 1 ? 'class' : 'classes'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Rows and Columns Canvas */}
          <div className="relative grid grid-cols-[64px_repeat(var(--cols),_1fr)]"
               style={{ '--cols': visibleDays.length } as React.CSSProperties}>
            
            {/* Time labels column */}
            <div className="border-r border-slate-100 text-slate-400">
              {hours.map((hour) => {
                const timeString = `${hour.toString().padStart(2, '0')}:00`;
                return (
                  <div
                    key={hour}
                    className="h-20 border-b border-slate-100 p-1 text-[11px] font-mono text-right pr-2 text-slate-400 tabular-nums select-none"
                  >
                    {formatTimeDisplay(timeString)}
                  </div>
                );
              })}
            </div>

            {/* Day columns */}
            {visibleDays.map((day) => {
              const isToday = day === currentDay;
              const dayEntries = filteredEntries.filter((e) => e.day === day);

              return (
                <div
                  key={day}
                  className={`relative border-r border-slate-100 last:border-r-0 ${
                    isToday ? 'bg-indigo-50/15' : ''
                  }`}
                >
                  {/* Empty hourly slot grid lines for click-to-add */}
                  {hours.map((hour) => {
                    const slotTime = `${hour.toString().padStart(2, '0')}:00`;
                    return (
                      <div
                        key={hour}
                        onClick={() => onAddAtSlot(day, slotTime)}
                        title={`Click to add class on ${day} at ${formatTimeDisplay(slotTime)}`}
                        className="h-20 border-b border-slate-100 transition-colors hover:bg-slate-100/50 cursor-pointer group flex items-start justify-end p-1"
                      >
                        <span className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 font-mono pr-1 pt-0.5 pointer-events-none">
                          + add
                        </span>
                      </div>
                    );
                  })}

                  {/* Current Time Indicator Line for Today */}
                  {isToday && currentTimePercentage >= 0 && (
                    <div
                      className="absolute left-0 right-0 z-10 pointer-events-none flex items-center"
                      style={{ top: `${currentTimePercentage}%` }}
                    >
                      <div className="w-2 h-2 rounded-full bg-rose-500 -ml-1 shadow-xs" />
                      <div className="w-full h-0.5 bg-rose-500" />
                    </div>
                  )}

                  {/* Timetable Entry Cards Positioned Absolutely */}
                  {dayEntries.map((entry) => {
                    const startMins = timeToMinutes(entry.startTime);
                    const endMins = timeToMinutes(entry.endTime);
                    const durationMins = Math.max(20, endMins - startMins);

                    const topOffsetMins = startMins - startHour * 60;
                    const topPct = (topOffsetMins / totalDayMinutes) * 100;
                    const heightPct = (durationMins / totalDayMinutes) * 100;

                    const color = getColorScheme(entry.color);
                    const conflict = isConflicting(entry);

                    return (
                      <div
                        key={entry.id}
                        onClick={() => onSelectEntry(entry)}
                        className="absolute inset-x-1.5 rounded-lg border p-2 transition-all duration-150 hover:shadow-md cursor-pointer z-1 flex flex-col justify-between overflow-hidden group"
                        style={{
                          top: `${Math.max(0, topPct)}%`,
                          height: `calc(${heightPct}% - 4px)`,
                          backgroundColor: color.bg,
                          borderColor: conflict ? '#EF4444' : color.border,
                          borderLeftWidth: '3px',
                          borderLeftColor: conflict ? '#EF4444' : color.accent,
                        }}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className="text-[11px] font-bold tracking-tight truncate"
                              style={{ color: color.text }}
                            >
                              {entry.subjectCode || entry.subjectName}
                            </span>
                            {conflict && (
                              <span title="Schedule conflict!" className="text-rose-600 shrink-0">
                                <AlertCircle className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>

                          <div className="text-[12px] font-semibold text-slate-800 line-clamp-1 leading-tight mt-0.5">
                            {entry.subjectName}
                          </div>

                          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-600 mt-1 tabular-nums">
                            <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            <span>
                              {formatTimeDisplay(entry.startTime)} – {formatTimeDisplay(entry.endTime)}
                            </span>
                          </div>
                        </div>

                        {/* Secondary metadata if slot is tall enough */}
                        {durationMins >= 45 && (
                          <div className="mt-1 pt-1 border-t border-black/5 flex items-center justify-between text-[10px] text-slate-600">
                            {entry.room ? (
                              <span className="flex items-center gap-1 truncate text-slate-700">
                                <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span className="truncate">{entry.room}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400">{entry.type}</span>
                            )}

                            {entry.link && (
                              <a
                                href={entry.link}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-indigo-600 hover:text-indigo-800"
                                title="Open Class Link"
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
