import React, { useState, useEffect, useRef } from 'react';
import { TimetableEntry, StudySessionLog } from '../types';
import { formatDuration, playFocusChime } from '../utils/timeUtils';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Trash2,
  TrendingUp,
  Clock
} from 'lucide-react';

interface StudyFocusTimerProps {
  entries: TimetableEntry[];
  studyLogs: StudySessionLog[];
  onAddStudyLog: (log: Omit<StudySessionLog, 'id' | 'timestamp'>) => void;
  onDeleteStudyLog: (id: string) => void;
  initialSubject?: { name: string; code: string } | null;
}

export const StudyFocusTimer: React.FC<StudyFocusTimerProps> = ({
  entries,
  studyLogs,
  onAddStudyLog,
  onDeleteStudyLog,
  initialSubject,
}) => {
  // Extract unique subjects from entries
  const uniqueSubjects = Array.from(
    new Map(entries.map((e) => [e.subjectName, { name: e.subjectName, code: e.subjectCode }])).values()
  );

  const presets = [
    { label: '25m', minutes: 25, desc: 'Pomodoro' },
    { label: '50m', minutes: 50, desc: 'Deep Block' },
    { label: '90m', minutes: 90, desc: 'Ultradian' },
    { label: '15m', minutes: 15, desc: 'Quick Sprint' },
  ];

  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Subject and topic details
  const [subjectName, setSubjectName] = useState(
    initialSubject?.name || uniqueSubjects[0]?.name || 'General Study'
  );
  const [subjectCode, setSubjectCode] = useState(
    initialSubject?.code || uniqueSubjects[0]?.code || 'STUDY'
  );
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [completedNotification, setCompletedNotification] = useState(false);

  // Sync if initialSubject changes
  useEffect(() => {
    if (initialSubject) {
      setSubjectName(initialSubject.name);
      setSubjectCode(initialSubject.code);
    }
  }, [initialSubject]);

  // Timer loop
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            if (soundEnabled) {
              playFocusChime();
            }
            setCompletedNotification(true);
            // Log study session
            onAddStudyLog({
              subjectName: subjectName || 'General Study',
              subjectCode: subjectCode || 'STUDY',
              topic: topic || 'Focused Revision',
              durationMinutes: selectedMinutes,
              completed: true,
              notes: notes,
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, selectedMinutes, soundEnabled, subjectName, subjectCode, topic, notes, onAddStudyLog]);

  const setPreset = (mins: number) => {
    setIsRunning(false);
    setSelectedMinutes(mins);
    setSecondsRemaining(mins * 60);
    setCompletedNotification(false);
  };

  const handleTogglePlay = () => {
    if (secondsRemaining === 0) {
      setSecondsRemaining(selectedMinutes * 60);
    }
    setIsRunning(!isRunning);
    setCompletedNotification(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining(selectedMinutes * 60);
    setCompletedNotification(false);
  };

  const handleAddFiveMinutes = () => {
    setSecondsRemaining((prev) => prev + 300);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const totalSeconds = selectedMinutes * 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100 : 0;

  // Aggregate study hours by subject
  const subjectBreakdown = studyLogs.reduce((acc, log) => {
    const key = log.subjectName;
    acc[key] = (acc[key] || 0) + log.durationMinutes;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto w-full">
      {/* Main Focus Timer Card */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col justify-between">
        <div>
          {/* Top header with presets and sound */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              {presets.map((p) => (
                <button
                  key={p.minutes}
                  onClick={() => setPreset(p.minutes)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    selectedMinutes === p.minutes
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{p.label}</span>
                  <span className="hidden sm:inline text-[10px] text-slate-400 ml-1 font-normal">
                    {p.desc}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg border transition-colors ${
                  soundEnabled
                    ? 'border-indigo-200 text-indigo-600 bg-indigo-50/50'
                    : 'border-slate-200 text-slate-400 hover:text-slate-600'
                }`}
                title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Target Subject Selector */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Course / Subject
              </label>
              <select
                value={subjectName}
                onChange={(e) => {
                  const val = e.target.value;
                  setSubjectName(val);
                  const found = uniqueSubjects.find((s) => s.name === val);
                  if (found) setSubjectCode(found.code);
                }}
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {uniqueSubjects.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.code ? `${s.code} - ` : ''}{s.name}
                  </option>
                ))}
                <option value="General Study">General Study / Self-Paced</option>
                <option value="Exam Preparation">Exam Preparation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Specific Topic or Goal
              </label>
              <input
                type="text"
                placeholder="e.g. Chapter 4 problem set, Red-Black Trees"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Big Clock Display with Circular / Line Progress */}
          <div className="py-12 flex flex-col items-center justify-center">
            {completedNotification && (
              <div className="mb-4 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Session completed! {selectedMinutes} minutes logged to your study record.</span>
              </div>
            )}

            <div className="text-7xl md:text-8xl font-mono font-bold tracking-tight text-slate-900 tabular-nums">
              {timeFormatted}
            </div>

            <div className="text-xs text-slate-400 font-medium mt-2 flex items-center gap-1.5">
              <span>{subjectName}</span>
              {topic && (
                <>
                  <span>·</span>
                  <span className="text-slate-600">{topic}</span>
                </>
              )}
            </div>

            {/* Linear Progress Bar */}
            <div className="w-full max-w-md bg-slate-100 h-2 rounded-full overflow-hidden mt-6">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleReset}
            className="p-3 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleTogglePlay}
            className={`px-8 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{secondsRemaining === 0 ? 'Start Over' : 'Start Focus'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleAddFiveMinutes}
            className="px-3.5 py-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
            title="Extend by 5 minutes"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+5m</span>
          </button>
        </div>
      </div>

      {/* Side Log & Study Distribution Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-5">
        {/* Subject Breakdown Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>Study Time by Subject</span>
          </h3>

          <div className="mt-4 flex flex-col gap-3">
            {Object.keys(subjectBreakdown).length === 0 ? (
              <div className="text-xs text-slate-400 py-3 text-center">
                No study sessions recorded yet. Start the timer to log your hours.
              </div>
            ) : (
              Object.entries(subjectBreakdown).map(([sub, mins]) => {
                const maxMins = Math.max(...Object.values(subjectBreakdown));
                const pct = (mins / (maxMins || 1)) * 100;
                return (
                  <div key={sub} className="text-xs">
                    <div className="flex justify-between font-medium mb-1">
                      <span className="text-slate-800 truncate">{sub}</span>
                      <span className="font-mono text-slate-600 tabular-nums">{formatDuration(mins)}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Study Sessions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Session History</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono tabular-nums">
              {studyLogs.length} logged
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[340px] flex flex-col gap-2.5 pr-1">
            {studyLogs.length === 0 ? (
              <div className="text-xs text-slate-400 py-8 text-center">
                Complete a session with the timer to build your focus log.
              </div>
            ) : (
              studyLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start justify-between gap-2 text-xs hover:border-slate-200 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 truncate">
                        {log.subjectName}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px] tabular-nums">
                        {formatDuration(log.durationMinutes)}
                      </span>
                    </div>
                    {log.topic && (
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">
                        {log.topic}
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(log.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteStudyLog(log.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors shrink-0"
                    title="Delete log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
