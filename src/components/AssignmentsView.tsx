import React, { useState } from 'react';
import { Assignment, TimetableEntry } from '../types';
import { CheckCircle2, Circle, Clock, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';

interface AssignmentsViewProps {
  assignments: Assignment[];
  entries: TimetableEntry[];
  onAddAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  onUpdateStatus: (id: string, status: Assignment['status']) => void;
  onDeleteAssignment: (id: string) => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  assignments,
  entries,
  onAddAssignment,
  onUpdateStatus,
  onDeleteAssignment,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'in_progress' | 'completed'>('all');
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [subjectName, setSubjectName] = useState(entries[0]?.subjectName || 'Computer Science');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [priority, setPriority] = useState<Assignment['priority']>('medium');
  const [notes, setNotes] = useState('');

  // Extract subjects
  const subjectList = Array.from(
    new Map(entries.map((e) => [e.subjectName, { name: e.subjectName, code: e.subjectCode }])).values()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matched = subjectList.find((s) => s.name === subjectName);
    onAddAssignment({
      title: title.trim(),
      subjectName,
      subjectCode: matched?.code || 'GEN',
      dueDate,
      priority,
      status: 'todo',
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setNotes('');
    setIsAdding(false);
  };

  const filtered = assignments.filter((a) => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  const getDueBadge = (dueDateStr: string) => {
    const due = new Date(dueDateStr).getTime();
    const now = new Date().setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="text-rose-600 font-semibold font-mono tabular-nums">{Math.abs(diffDays)}d overdue</span>;
    }
    if (diffDays === 0) {
      return <span className="text-amber-600 font-semibold">Due today</span>;
    }
    if (diffDays === 1) {
      return <span className="text-amber-600 font-semibold">Due tomorrow</span>;
    }
    return <span className="text-slate-500 font-mono tabular-nums">In {diffDays} days</span>;
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Header and Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Assignments & Exam Deadlines
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep track of homework, problem sets, lab reports, and upcoming midterms
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['all', 'todo', 'in_progress', 'completed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${
                  filterStatus === s
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s === 'in_progress' ? 'In Progress' : s}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Quick Add Form Drawer */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-3">
            Add Assignment or Exam
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Title / Task Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Problem Set 5, Physics Lab Report, Midterm 2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject
              </label>
              <select
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {subjectList.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.code} - {s.name}
                  </option>
                ))}
                <option value="General Study">General / Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Assignment['priority'])}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Notes
              </label>
              <input
                type="text"
                placeholder="Questions 1-5, submit on portal"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Save Assignment
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No assignments match the selected filter.
          </div>
        ) : (
          filtered.map((item) => {
            const isDone = item.status === 'completed';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  isDone
                    ? 'bg-slate-50/70 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => onUpdateStatus(item.id, isDone ? 'todo' : 'completed')}
                    className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <h4
                      className={`text-sm font-bold text-slate-900 ${
                        isDone ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {item.title}
                    </h4>

                    {/* Metadata line with typographic separators (anti-slop rule) */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="font-semibold text-slate-800">{item.subjectCode}</span>
                      <span>·</span>
                      <span>{item.subjectName}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{item.dueDate}</span>
                      </span>
                      <span>·</span>
                      {getDueBadge(item.dueDate)}
                      <span>·</span>
                      <span
                        className={`capitalize font-medium ${
                          item.priority === 'high'
                            ? 'text-rose-600'
                            : item.priority === 'medium'
                            ? 'text-amber-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {item.priority} Priority
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onDeleteAssignment(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
