import React, { useState, useEffect } from 'react';
import { TimetableEntry, DayOfWeek, ClassType } from '../types';
import { 
  DAYS_OF_WEEK, 
  COLOR_OPTIONS, 
  timeToMinutes, 
  minutesToTime, 
  checkOverlap,
  formatTimeDisplay 
} from '../utils/timeUtils';
import { X, Trash2, AlertTriangle, Clock, Calendar } from 'lucide-react';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entries: Omit<TimetableEntry, 'id'>[]) => void;
  onUpdate: (entry: TimetableEntry) => void;
  onDelete: (id: string) => void;
  initialEntry?: TimetableEntry | null;
  defaultDay?: DayOfWeek;
  defaultTime?: string;
  existingEntries: TimetableEntry[];
}

export const EntryModal: React.FC<EntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  initialEntry,
  defaultDay = 'Monday',
  defaultTime = '09:00',
  existingEntries,
}) => {
  if (!isOpen) return null;

  const isEditing = !!initialEntry;

  const [subjectName, setSubjectName] = useState(initialEntry?.subjectName || '');
  const [subjectCode, setSubjectCode] = useState(initialEntry?.subjectCode || '');
  const [type, setType] = useState<ClassType>(initialEntry?.type || 'Lecture');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(
    initialEntry ? [initialEntry.day] : [defaultDay]
  );
  const [startTime, setStartTime] = useState(initialEntry?.startTime || defaultTime);
  const [endTime, setEndTime] = useState(
    initialEntry?.endTime ||
      minutesToTime(timeToMinutes(defaultTime) + (type === 'Lab' ? 120 : 60))
  );
  const [room, setRoom] = useState(initialEntry?.room || '');
  const [instructor, setInstructor] = useState(initialEntry?.instructor || '');
  const [color, setColor] = useState(initialEntry?.color || 'indigo');
  const [notes, setNotes] = useState(initialEntry?.notes || '');
  const [link, setLink] = useState(initialEntry?.link || '');

  // Keep end time sensible when start time updates
  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    const startM = timeToMinutes(newStart);
    const endM = timeToMinutes(endTime);
    if (endM <= startM) {
      setEndTime(minutesToTime(startM + 60));
    }
  };

  const toggleDay = (day: DayOfWeek) => {
    if (isEditing) {
      setSelectedDays([day]);
      return;
    }
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Check for any potential conflicts on the selected days
  const hypotheticalOverlaps = selectedDays.flatMap((day) => {
    const dummy: TimetableEntry = {
      id: initialEntry?.id || 'temp',
      subjectName,
      subjectCode,
      type,
      day,
      startTime,
      endTime,
      room,
      instructor,
      color,
    };
    return existingEntries
      .filter((e) => e.id !== initialEntry?.id && checkOverlap(dummy, e))
      .map((e) => ({ day, collidingWith: e }));
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    if (isEditing && initialEntry) {
      onUpdate({
        ...initialEntry,
        subjectName: subjectName.trim(),
        subjectCode: subjectCode.trim(),
        type,
        day: selectedDays[0],
        startTime,
        endTime,
        room: room.trim(),
        instructor: instructor.trim(),
        color,
        notes: notes.trim() || undefined,
        link: link.trim() || undefined,
        isStudySession: type === 'Study Session',
      });
    } else {
      const newEntries = selectedDays.map((day) => ({
        subjectName: subjectName.trim(),
        subjectCode: subjectCode.trim(),
        type,
        day,
        startTime,
        endTime,
        room: room.trim(),
        instructor: instructor.trim(),
        color,
        notes: notes.trim() || undefined,
        link: link.trim() || undefined,
        isStudySession: type === 'Study Session',
      }));
      onSave(newEntries);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isEditing ? 'Edit Class / Activity' : 'Add Class / Study Session'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing ? 'Modify timeslot or location' : 'Create recurring or single schedule entries'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* Conflict Warning if overlapping */}
          {hypotheticalOverlaps.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Timeslot Conflict Detected</span>
                <p className="text-amber-800 mt-0.5">
                  Overlaps with{' '}
                  <span className="font-bold">
                    {hypotheticalOverlaps[0].collidingWith.subjectName}
                  </span>{' '}
                  on {hypotheticalOverlaps[0].day} (
                  {formatTimeDisplay(hypotheticalOverlaps[0].collidingWith.startTime)} -{' '}
                  {formatTimeDisplay(hypotheticalOverlaps[0].collidingWith.endTime)})
                </p>
              </div>
            </div>
          )}

          {/* Subject Name and Code */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Data Structures, Physics II"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Code
              </label>
              <input
                type="text"
                placeholder="CS 201"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase"
              />
            </div>
          </div>

          {/* Activity Type & Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ClassType)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Lecture">Lecture</option>
                <option value="Lab">Lab</option>
                <option value="Seminar">Seminar</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Workshop">Workshop</option>
                <option value="Study Session">Study Session</option>
                <option value="Office Hours">Office Hours</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Color Tag
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${
                      color === c.id ? 'scale-125 border-slate-900 shadow-xs' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.accent }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Days of Week (Multi-select for recurring classes) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                {isEditing ? 'Day of Week' : 'Days (Select multiple for recurring)'}
              </label>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setSelectedDays(['Monday', 'Wednesday', 'Friday'])}
                  className="text-[10px] text-indigo-600 hover:underline font-medium"
                >
                  Quick Mon/Wed/Fri
                </button>
              )}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {DAYS_OF_WEEK.map((day) => {
                const active = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`py-2 text-xs font-bold rounded-lg transition-colors ${
                      active
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Start and End */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Location and Instructor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Room / Location
              </label>
              <input
                type="text"
                placeholder="e.g. Hall 302, Online Zoom"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instructor / Professor
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Vance"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Syllabus / Zoom Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Class Portal or Zoom Link
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes or Syllabus Highlights
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Bring lab coat; office hours are by appointment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {isEditing ? (
              <button
                type="button"
                onClick={() => {
                  if (initialEntry) onDelete(initialEntry.id);
                  onClose();
                }}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
              >
                {isEditing ? 'Save Changes' : `Add Class (${selectedDays.length} day${selectedDays.length > 1 ? 's' : ''})`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
