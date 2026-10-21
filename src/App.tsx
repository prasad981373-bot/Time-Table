/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TimetableEntry, 
  Assignment, 
  StudySessionLog, 
  StudentSettings, 
  ViewTab, 
  DayOfWeek 
} from './types';
import { 
  DEFAULT_SETTINGS, 
  STEM_TIMETABLE, 
  INITIAL_ASSIGNMENTS, 
  INITIAL_STUDY_LOGS 
} from './data/defaultData';
import { 
  getCurrentDayOfWeek, 
  getCurrentMinutesFromMidnight, 
  findScheduleConflicts,
  formatTimeDisplay 
} from './utils/timeUtils';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TimetableGrid } from './components/TimetableGrid';
import { DailyAgendaView } from './components/DailyAgendaView';
import { StudyFocusTimer } from './components/StudyFocusTimer';
import { SmartStudyPlanner } from './components/SmartStudyPlanner';
import { AssignmentsView } from './components/AssignmentsView';
import { EntryModal } from './components/EntryModal';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';

const STORAGE_KEYS = {
  ENTRIES: 'schedura_entries_v1',
  ASSIGNMENTS: 'schedura_assignments_v1',
  STUDY_LOGS: 'schedura_study_logs_v1',
  SETTINGS: 'schedura_settings_v1',
};

export default function App() {
  // Load initial states with local storage resilience
  const [entries, setEntries] = useState<TimetableEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ENTRIES);
      return saved ? JSON.parse(saved) : STEM_TIMETABLE;
    } catch {
      return STEM_TIMETABLE;
    }
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
    } catch {
      return INITIAL_ASSIGNMENTS;
    }
  });

  const [studyLogs, setStudyLogs] = useState<StudySessionLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDY_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_STUDY_LOGS;
    } catch {
      return INITIAL_STUDY_LOGS;
    }
  });

  const [settings, setSettings] = useState<StudentSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.studentName === 'Alex Rivera' || !parsed.studentName) {
          parsed.studentName = 'Prasad';
        }
        return parsed;
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Current view and date state
  const [currentTab, setCurrentTab] = useState<ViewTab>('weekly');
  const [currentDay, setCurrentDay] = useState<DayOfWeek>(getCurrentDayOfWeek());
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');

  // Modals state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [modalDefaultDay, setModalDefaultDay] = useState<DayOfWeek>(currentDay);
  const [modalDefaultTime, setModalDefaultTime] = useState<string>('09:00');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Focus timer subject preset passed from other views
  const [focusSubject, setFocusSubject] = useState<{ name: string; code: string } | null>(null);

  // Live clock tick
  const [nowDate, setNowDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowDate(new Date());
    }, 30000); // Check every 30s
    return () => clearInterval(timer);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDY_LOGS, JSON.stringify(studyLogs));
  }, [studyLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Derived state: Schedule conflicts
  const conflicts = findScheduleConflicts(entries);

  // Time string for sidebar
  const currentTimeString = nowDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: settings.timeFormat === '12h',
  });

  // Handler: Add entries
  const handleSaveEntries = (newEntries: Omit<TimetableEntry, 'id'>[]) => {
    const created: TimetableEntry[] = newEntries.map((e, idx) => ({
      ...e,
      id: `entry-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
    }));
    setEntries((prev) => [...prev, ...created]);
  };

  // Handler: Update entry
  const handleUpdateEntry = (updated: TimetableEntry) => {
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  // Handler: Delete entry
  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // Handler: Open Add Modal from empty grid slot
  const handleAddAtSlot = (day: DayOfWeek, time: string) => {
    setEditingEntry(null);
    setModalDefaultDay(day);
    setModalDefaultTime(time);
    setIsEntryModalOpen(true);
  };

  // Handler: Open Edit modal from clicked card
  const handleSelectEntry = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setModalDefaultDay(entry.day);
    setModalDefaultTime(entry.startTime);
    setIsEntryModalOpen(true);
  };

  // Handler: Start focus session from agenda/timetable
  const handleStartFocusSession = (subjectName: string, subjectCode: string) => {
    setFocusSubject({ name: subjectName, code: subjectCode });
    setCurrentTab('timer');
  };

  // Handler: Add single study session from Smart Planner
  const handleAddStudySessionToTimetable = (entryData: Omit<TimetableEntry, 'id'>) => {
    const newEntry: TimetableEntry = {
      ...entryData,
      id: `study-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setEntries((prev) => [...prev, newEntry]);
  };

  // Handler: Add assignment
  const handleAddAssignment = (newAsg: Omit<Assignment, 'id'>) => {
    const created: Assignment = {
      ...newAsg,
      id: `asg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setAssignments((prev) => [created, ...prev]);
  };

  // Handler: Update assignment status
  const handleUpdateAssignmentStatus = (id: string, status: Assignment['status']) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  // Handler: Delete assignment
  const handleDeleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  // Handler: Add study log
  const handleAddStudyLog = (logData: Omit<StudySessionLog, 'id' | 'timestamp'>) => {
    const newLog: StudySessionLog = {
      ...logData,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setStudyLogs((prev) => [newLog, ...prev]);
  };

  // Handler: Delete study log
  const handleDeleteStudyLog = (id: string) => {
    setStudyLogs((prev) => prev.filter((l) => l.id !== id));
  };

  // Handler: Preset switch
  const handleLoadPreset = (presetEntries: TimetableEntry[]) => {
    setEntries(presetEntries);
  };

  // Count classes for today
  const totalClassesToday = entries.filter((e) => e.day === currentDay).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Strict 3-zone Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddModal={() => {
          setEditingEntry(null);
          setModalDefaultDay(currentDay);
          setModalDefaultTime('09:00');
          setIsEntryModalOpen(true);
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        totalClassesToday={totalClassesToday}
        studentName={settings.studentName}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar */}
        <Sidebar
          settings={settings}
          entries={entries}
          assignments={assignments}
          studyLogs={studyLogs}
          conflictsCount={conflicts.length}
          selectedTypeFilter={selectedTypeFilter}
          onSelectTypeFilter={setSelectedTypeFilter}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenAddModal={() => {
            setEditingEntry(null);
            setModalDefaultDay(currentDay);
            setModalDefaultTime('09:00');
            setIsEntryModalOpen(true);
          }}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          currentTimeString={currentTimeString}
          currentDayName={currentDay}
        />

        {/* View Switch Content Area */}
        <div className="flex-1 min-w-0 flex flex-col">
          {currentTab === 'weekly' && (
            <TimetableGrid
              entries={entries}
              showWeekend={settings.showWeekend}
              onToggleWeekend={() =>
                setSettings((s) => ({ ...s, showWeekend: !s.showWeekend }))
              }
              startHour={settings.startHour}
              endHour={settings.endHour}
              conflicts={conflicts}
              currentDay={currentDay}
              onSelectEntry={handleSelectEntry}
              onAddAtSlot={handleAddAtSlot}
              typeFilter={selectedTypeFilter}
              studentName={settings.studentName}
            />
          )}

          {currentTab === 'today' && (
            <DailyAgendaView
              entries={entries}
              currentDay={currentDay}
              onSelectDay={setCurrentDay}
              onSelectEntry={handleSelectEntry}
              onStartFocusSession={handleStartFocusSession}
              onAddClass={() => {
                setEditingEntry(null);
                setModalDefaultDay(currentDay);
                setModalDefaultTime('10:00');
                setIsEntryModalOpen(true);
              }}
              studentName={settings.studentName}
            />
          )}

          {currentTab === 'timer' && (
            <StudyFocusTimer
              entries={entries}
              studyLogs={studyLogs}
              onAddStudyLog={handleAddStudyLog}
              onDeleteStudyLog={handleDeleteStudyLog}
              initialSubject={focusSubject}
            />
          )}

          {currentTab === 'planner' && (
            <SmartStudyPlanner
              entries={entries}
              assignments={assignments}
              onAddStudySessionToTimetable={handleAddStudySessionToTimetable}
              startHour={settings.startHour}
              endHour={settings.endHour}
            />
          )}

          {currentTab === 'assignments' && (
            <AssignmentsView
              assignments={assignments}
              entries={entries}
              onAddAssignment={handleAddAssignment}
              onUpdateStatus={handleUpdateAssignmentStatus}
              onDeleteAssignment={handleDeleteAssignment}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <EntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSave={handleSaveEntries}
        onUpdate={handleUpdateEntry}
        onDelete={handleDeleteEntry}
        initialEntry={editingEntry}
        defaultDay={modalDefaultDay}
        defaultTime={modalDefaultTime}
        existingEntries={entries}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        entries={entries}
        settings={settings}
        onLoadPreset={handleLoadPreset}
        onImportJSON={(imported) => setEntries(imported)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
      />
    </div>
  );
}
