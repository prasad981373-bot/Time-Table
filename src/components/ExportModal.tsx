import React, { useRef } from 'react';
import { TimetableEntry, StudentSettings } from '../types';
import { exportToICS, downloadFile } from '../utils/timeUtils';
import { 
  STEM_TIMETABLE, 
  PREMED_TIMETABLE, 
  HIGHSCHOOL_TIMETABLE 
} from '../data/defaultData';
import { X, Calendar, Printer, Download, Upload, RefreshCw, Check } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: TimetableEntry[];
  settings: StudentSettings;
  onLoadPreset: (presetEntries: TimetableEntry[]) => void;
  onImportJSON: (importedEntries: TimetableEntry[]) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  entries,
  settings,
  onLoadPreset,
  onImportJSON,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportICS = () => {
    const icsContent = exportToICS(entries, settings.studentName);
    const filename = `${settings.studentName.toLowerCase().replace(/\s+/g, '_')}_schedule.ics`;
    downloadFile(icsContent, filename, 'text/calendar;charset=utf-8');
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(entries, null, 2);
    downloadFile(jsonStr, `timetable_backup_${Date.now()}.json`, 'application/json');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportJSON(parsed);
          onClose();
        } else {
          alert('Invalid JSON file format. Expected an array of timetable entries.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Export, Sync & Schedule Presets
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sync to your calendar app, print physical schedule, or switch templates
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* Calendar Sync / Export */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Calendar Export & Sync
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportICS}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all text-left flex flex-col justify-between group"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Export .ICS Calendar
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Standard iCal format. Works directly with Google Calendar, Apple Calendar, and Outlook.
                  </p>
                </div>
                <div className="mt-3 text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                  <span>Download .ics</span>
                  <span>→</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  setTimeout(() => window.print(), 200);
                }}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all text-left flex flex-col justify-between group"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 mb-2">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Print Schedule
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Optimized print view formatted for clean physical wall schedules or desk binders.
                  </p>
                </div>
                <div className="mt-3 text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                  <span>Print View</span>
                  <span>→</span>
                </div>
              </button>
            </div>
          </div>

          {/* Backup & Restore */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Data Backup & Restore
            </h4>

            <div className="flex gap-2">
              <button
                onClick={handleExportJSON}
                className="flex-1 py-2 px-3 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save JSON Backup</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restore JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Schedule Presets / Templates */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Sample Schedule Templates
            </h4>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  onLoadPreset(STEM_TIMETABLE);
                  onClose();
                }}
                className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    STEM & Computer Science
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Data Structures, Linear Algebra, Physics Lab, Web Architecture + Study Blocks
                  </div>
                </div>
                <span className="text-xs font-semibold text-indigo-600">Load</span>
              </button>

              <button
                onClick={() => {
                  onLoadPreset(PREMED_TIMETABLE);
                  onClose();
                }}
                className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Pre-Med & Health Sciences
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Anatomy & Physiology, Organic Chem Lab, Biostats + MCAT Study
                  </div>
                </div>
                <span className="text-xs font-semibold text-indigo-600">Load</span>
              </button>

              <button
                onClick={() => {
                  onLoadPreset(HIGHSCHOOL_TIMETABLE);
                  onClose();
                }}
                className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    High School 7-Period Day
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Calculus, AP Chem, English Lit, US History, Spanish, Study Hall
                  </div>
                </div>
                <span className="text-xs font-semibold text-indigo-600">Load</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Clear current timetable and start with a blank schedule?')) {
                    onLoadPreset([]);
                    onClose();
                  }
                }}
                className="p-3 rounded-xl border border-dashed border-rose-200 hover:bg-rose-50/50 transition-colors text-left flex items-center justify-between text-rose-700"
              >
                <div>
                  <div className="text-xs font-bold">Start Blank (Clear Schedule)</div>
                  <div className="text-[11px] text-rose-500">
                    Wipes existing timetable so you can build your own from scratch
                  </div>
                </div>
                <span className="text-xs font-semibold">Clear</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
