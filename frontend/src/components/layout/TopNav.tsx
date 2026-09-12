import React from 'react';
import { Anchor, ShieldCheck, User, LogOut } from 'lucide-react';

export const TopNav: React.FC = () => {
  return (
    <header className="bg-slate-900 text-white px-6 py-3 border-b border-slate-800 flex items-center justify-between shadow-sm">
      {/* App Branding */}
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md">
          <Anchor className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
            SpillGuard
            <span className="text-xs font-medium text-slate-400 font-mono">- Maritime Pollution Forensic Intelligence</span>
          </h1>
        </div>
      </div>

      {/* Status Badges & Profile */}
      <div className="flex items-center space-x-4 text-xs">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          Validated offline source
        </span>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 font-medium font-mono">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          Synthetic AIS / Demo
        </span>

        <div className="h-4 w-px bg-slate-800"></div>

        <div className="flex items-center space-x-2 text-slate-300">
          <User className="w-4 h-4 text-slate-400" />
          <span className="font-medium">Analyst analyst1</span>
          <button className="text-slate-400 hover:text-slate-200 ml-1">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
