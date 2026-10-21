import React, { useState } from 'react';
import { TimetableEntry, Assignment, DayOfWeek } from '../types';
import { 
  timeToMinutes, 
  minutesToTime, 
  formatTimeDisplay, 
  formatDuration, 
  DAYS_OF_WEEK, 
  WORKDAYS 
} from '../utils/timeUtils';
import { Sparkles, CalendarPlus, Clock, Target, Plus, Check } from 'lucide-react';

interface SmartStudyPlannerProps {
  entries: TimetableEntry[];
  assignments: Assignment[];
  onAddStudySessionToTimetable: (entry: Omit<TimetableEntry, 'id'>) => void;
  startHour: number;
  endHour: number;
}

interface FreeSlot {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  recommendedSubject?: string;
  recommendedCode?: string;
  reason?: string;
}

export const SmartStudyPlanner: React.FC<SmartStudyPlannerProps> = ({
  entries,
  assignments,
  onAddStudySessionToTimetable,
  startHour,
  endHour,
}) => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [addedSlotKeys, setAddedSlotKeys] = useState<Set<string>>(new Set());

  // Extract subjects
  const subjects = Array.from(
    new Map(entries.map((e) => [e.subjectName, { name: e.subjectName, code: e.subjectCode }])).values()
  );

  // Find upcoming assignments to guide priorities
  const pendingAssignments = assignments
    .filter((a) => a.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Algorithm to find empty gaps during the week
  const findGaps = (): FreeSlot[] => {
    const slots: FreeSlot[] = [];
    const minStudyDuration = 45; // At least 45 minutes for a productive session

    WORKDAYS.forEach((day) => {
      // Get all entries for this day sorted by start time
      const dayEntries = entries
        .filter((e) => e.day === day)
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

      let currentPointer = startHour * 60; // e.g. 08:00 AM (480 mins)
      const dayEnd = endHour * 60; // e.g. 20:00 (1200 mins)

      dayEntries.forEach((entry) => {
        const entryStart = timeToMinutes(entry.startTime);
        const entryEnd = timeToMinutes(entry.endTime);

        if (entryStart - currentPointer >= minStudyDuration) {
          slots.push({
            day,
            startTime: minutesToTime(currentPointer),
            endTime: minutesToTime(entryStart),
            durationMinutes: entryStart - currentPointer,
          });
        }

        if (entryEnd > currentPointer) {
          currentPointer = entryEnd;
        }
      });

      // Gap between last class and end of study day
      if (dayEnd - currentPointer >= minStudyDuration) {
        slots.push({
          day,
          startTime: minutesToTime(currentPointer),
          endTime: minutesToTime(dayEnd),
          durationMinutes: dayEnd - currentPointer,
        });
      }
    });

    // Match top gaps with upcoming assignment needs
    return slots.slice(0, 8).map((slot, idx) => {
      const targetAsg = pendingAssignments[idx % (pendingAssignments.length || 1)];
      const subject = targetAsg
        ? { name: targetAsg.subjectName, code: targetAsg.subjectCode }
        : subjects[idx % (subjects.length || 1)] || { name: 'Deep Work', code: 'STUDY' };

      const daysUntilDue = targetAsg
        ? Math.ceil((new Date(targetAsg.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 7;

      return {
        ...slot,
        recommendedSubject: subject.name,
        recommendedCode: subject.code,
        reason: targetAsg
          ? `Work on "${targetAsg.title}" (Due in ${daysUntilDue} days)`
          : 'Consolidate lecture notes and problem sets',
      };
    });
  };

  const freeSlots = findGaps();

  const handleAddSlot = (slot: FreeSlot) => {
    const key = `${slot.day}-${slot.startTime}-${slot.endTime}`;
    if (addedSlotKeys.has(key)) return;

    // Cap the study session to max 90 or 120 minutes so it is not exhausting
    const startMins = timeToMinutes(slot.startTime);
    const sessionDuration = Math.min(120, slot.durationMinutes);
    const endMins = startMins + sessionDuration;

    onAddStudySessionToTimetable({
      subjectName: `${slot.recommendedSubject || 'Deep Focus'} Revision`,
      subjectCode: slot.recommendedCode || 'STUDY',
      type: 'Study Session',
      day: slot.day,
      startTime: slot.startTime,
      endTime: minutesToTime(endMins),
      room: 'Library / Study Pod',
      instructor: 'Self-Directed',
      color: 'violet',
      notes: slot.reason,
      isStudySession: true,
    });

    setAddedSlotKeys(new Set(addedSlotKeys).add(key));
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Top Planner Info Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Schedule Optimization</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Automated Study Slot Finder
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Schedura scans the gaps between your lectures and labs, cross-referencing your upcoming assignment deadlines to schedule high-leverage study sessions directly into your timetable.
            </p>
          </div>
        </div>

        {/* Priority Status Strip */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] text-slate-500 block font-medium">Available Open Gaps</span>
            <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              {freeSlots.length}
            </span>
            <span className="text-[11px] text-slate-400 block">unoccupied blocks this week</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] text-slate-500 block font-medium">Pending Assignments</span>
            <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              {pendingAssignments.length}
            </span>
            <span className="text-[11px] text-slate-400 block">deadlines approaching</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] text-slate-500 block font-medium">Spaced Study Blocks</span>
            <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              {entries.filter((e) => e.isStudySession).length}
            </span>
            <span className="text-[11px] text-slate-400 block">blocks already locked in</span>
          </div>
        </div>
      </div>

      {/* Recommended Study Slots List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Recommended Study Blocks Between Classes
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            1-Click Add to Timetable
          </span>
        </div>

        {freeSlots.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No gaps available between your classes with current hour settings. Check your settings or expand day hours.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {freeSlots.map((slot, idx) => {
              const key = `${slot.day}-${slot.startTime}-${slot.endTime}`;
              const isAdded = addedSlotKeys.has(key);

              return (
                <div
                  key={key}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isAdded
                      ? 'bg-slate-50 border-slate-200 opacity-70'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {slot.day}
                      </span>
                      <span className="text-xs font-mono font-medium text-slate-500 tabular-nums">
                        {formatDuration(slot.durationMinutes)} window
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <h4 className="text-sm font-bold text-slate-900">
                        {slot.recommendedSubject}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {slot.reason}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-xs font-mono text-slate-600 tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {formatTimeDisplay(slot.startTime)} – {formatTimeDisplay(slot.endTime)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => handleAddSlot(slot)}
                      disabled={isAdded}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                        isAdded
                          ? 'bg-emerald-100 text-emerald-800 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added to Schedule</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Timetable</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Study Habit Insights */}
      <div className="bg-indigo-900 text-indigo-100 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-300" />
          <span>Evidence-Based Study Strategy</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs text-indigo-200">
          <div>
            <h4 className="font-bold text-white mb-1">Spaced Repetition</h4>
            <p className="leading-relaxed">
              Studying in 50–90 minute blocks spread across 3–4 days retains 200% more concepts than 6-hour cram sessions before exams.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-1">Active Recall Gaps</h4>
            <p className="leading-relaxed">
              Use 45-minute gaps directly after lectures to solve 2 practice problems or summarize key formulas while fresh in memory.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-1">Protected Deep Blocks</h4>
            <p className="leading-relaxed">
              Reserve at least two 90-minute blocks each week with your phone away for complex proofs, coding projects, or essay drafting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
