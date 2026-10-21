import React from 'react';
import { ViewTab } from '../types';
import { Calendar, Clock, BookOpen, Sparkles, CheckSquare, Plus, Download, Printer } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  totalClassesToday: number;
  studentName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  onOpenExportModal,
  totalClassesToday,
  studentName = 'Prasad',
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 md:px-8 py-3.5 no-print">
      <div className="flex items-center justify-between gap-4 md:gap-8 max-w-7xl mx-auto">
        {/* Zone 1: Brand Wordmark (one line) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('weekly');
            }}
            className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap hover:text-indigo-600 transition-colors"
          >
            Schedura
          </a>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 rounded-lg px-2.5 py-1">
            <span>{studentName}'s Dashboard</span>
          </span>
        </div>

        {/* Zone 2: Navigation Links / Mode Switcher */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => onSelectTab('weekly')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'weekly'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timetable</span>
          </button>

          <button
            onClick={() => onSelectTab('today')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'today'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Today's Classes</span>
            {totalClassesToday > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                currentTab === 'today' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {totalClassesToday}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('timer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'timer'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Focus Timer</span>
          </button>

          <button
            onClick={() => onSelectTab('planner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'planner'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Smart Planner</span>
          </button>

          <button
            onClick={() => onSelectTab('assignments')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'assignments'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks & Deadlines</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Tools */}
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton />

          <button
            onClick={onOpenExportModal}
            title="Export iCal or Print"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => window.print()}
            title="Print Timetable"
            className="hidden sm:flex p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-[0.98] transition-all whitespace-nowrap shadow-sm shadow-indigo-600/20"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Class</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
