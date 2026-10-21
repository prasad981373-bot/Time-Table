import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Monitor, CheckCircle2, X, Chrome } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showChromeGuide, setShowChromeGuide] = useState(false);

  // If already running standalone inside Chrome/desktop, render a subtle installed badge
  if (isInstalled) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-lg">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Installed in Chrome</span>
      </div>
    );
  }

  // Native Chrome prompt ready
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
        title="Deploy / Install App to Google Chrome"
      >
        <Chrome className="w-3.5 h-3.5 text-indigo-600" />
        <span>Install in Chrome</span>
      </button>
    );
  }

  // Fallback / guided modal for Chrome & other browsers
  return (
    <>
      <button
        onClick={() => setShowChromeGuide(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
        title="How to install in Chrome"
      >
        <Chrome className="w-3.5 h-3.5 text-slate-600" />
        <span className="hidden sm:inline">Add to Chrome</span>
        <span className="sm:hidden">Install</span>
      </button>

      {showChromeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Chrome className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Install in Google Chrome
                </h3>
              </div>
              <button
                onClick={() => setShowChromeGuide(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-0.5">Desktop Google Chrome:</span>
                Click the <strong>Install</strong> icon (<Monitor className="inline w-3 h-3 text-indigo-600" />) on the right side of the Chrome address bar, or click <strong>Chrome Menu (⋮) → Cast, save, and share → Install Schedura</strong>.
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-0.5">Chrome on Mobile / Android:</span>
                Tap <strong>Chrome Menu (⋮)</strong> at the top right, then tap <strong>Add to Home Screen / Install app</strong>.
              </div>
            </div>

            <button
              onClick={() => setShowChromeGuide(false)}
              className="mt-5 w-full py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
