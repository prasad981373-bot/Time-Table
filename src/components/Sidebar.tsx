import React from 'react';
import { StudentSettings, TimetableEntry, Assignment, StudySessionLog, ClassType } from '../types';
import { formatDuration } from '../utils/timeUtils';
import { 
  CalendarDays, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  FolderDown, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  settings: StudentSettings;
  entries: TimetableEntry[];
  assignments: Assignment[];
  studyLogs: StudySessionLog[];
  conflictsCount: number;
  selectedTypeFilter: string;
  onSelectTypeFilter: (type: string) => void;
  onOpenExportModal: () => void;
  onOpenAddModal: () => void;
  onOpenSettingsModal: () => void;
  currentTimeString: string;
  currentDayName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  settings,
  entries,
  assignments,
  studyLogs,
  conflictsCount,
  selectedTypeFilter,
  onSelectTypeFilter,
  onOpenExportModal,
  onOpenAddModal,
  onOpenSettingsModal,
  currentTimeString,
  currentDayName,
}) => {
  // Calculate total study logged this week
  const totalStudyMinutes = studyLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);
  const goalPercent = Math.min(
    100,
    Math.round((totalStudyMinutes / 60 / (settings.weeklyStudyGoalHours || 1)) * 100)
  );

  const pendingAssignmentsCount = assignments.filter((a) => a.status !== 'completed').length;
  const todayEntriesCount = entries.filter((e) => e.day === currentDayName).length;

  const classTypes: ClassType[] = [
    'Lecture',
    'Lab',
    'Seminar',
    'Tutorial',
    'Study Session',
    'Office Hours',
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-5 text-slate-800 no-print">
      {/* Student Profile Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-0.5">
              Student Dashboard
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {settings.studentName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{settings.semester}</p>
          </div>
          <button
            onClick={onOpenSettingsModal}
            className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 transition-colors"
          >
            Edit
          </button>
        </div>

        {/* Live Clock / Today badge */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentDayName}</span>
          </div>
          <span className="font-mono text-slate-900 font-semibold tabular-nums">
            {currentTimeString}
          </span>
        </div>
      </div>

      {/* Conflicts Alert if any */}
      {conflictsCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold">{conflictsCount} Schedule Overlap{conflictsCount > 1 ? 's' : ''}</span>
            <p className="text-[11px] text-amber-800 mt-0.5 leading-snug">
              Classes or study blocks share the exact same timeslot.
            </p>
          </div>
        </div>
      )}

      {/* Snapshot Metrics */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col gap-3">
        <div className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Weekly Overview
        </div>

        {/* Study Goal Progress */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-600 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-indigo-500" />
              <span>Study Goal</span>
            </span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {totalStudyHours}h / {settings.weeklyStudyGoalHours}h
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
            <span>{goalPercent}% complete</span>
            <span>{formatDuration(totalStudyMinutes)} logged</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <div className="p-2 bg-slate-50 rounded-lg">
            <span className="text-[11px] text-slate-500 block">Today's Total</span>
            <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
              {todayEntriesCount}
            </span>
            <span className="text-[10px] text-slate-400 block">sessions</span>
          </div>

          <div className="p-2 bg-slate-50 rounded-lg">
            <span className="text-[11px] text-slate-500 block">Due Tasks</span>
            <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
              {pendingAssignmentsCount}
            </span>
            <span className="text-[10px] text-slate-400 block">deadlines</span>
          </div>
        </div>
      </div>

      {/* Filter by Type */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Filter Schedule
          </span>
          {selectedTypeFilter !== 'ALL' && (
            <button
              onClick={() => onSelectTypeFilter('ALL')}
              className="text-[11px] text-indigo-600 hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <button
            onClick={() => onSelectTypeFilter('ALL')}
            className={`w-full text-left px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-between ${
              selectedTypeFilter === 'ALL'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>All Activities</span>
            <span className="font-mono text-[11px] text-slate-400 tabular-nums">
              {entries.length}
            </span>
          </button>

          {classTypes.map((type) => {
            const count = entries.filter((e) => e.type === type).length;
            if (count === 0 && selectedTypeFilter !== type) return null;

            return (
              <button
                key={type}
                onClick={() => onSelectTypeFilter(type)}
                className={`w-full text-left px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-between ${
                  selectedTypeFilter === type
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{type}</span>
                <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Action Tools */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-4 shadow-xs">
        <h3 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Calendar Sync</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Export your timetable directly into Apple Calendar, Google Calendar, or Outlook.
        </p>
        <button
          onClick={onOpenExportModal}
          className="mt-3 w-full py-2 px-3 text-xs font-semibold bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
        >
          <FolderDown className="w-3.5 h-3.5 text-slate-700" />
          <span>Export .ICS File</span>
        </button>
      </div>
    </aside>
  );
};
