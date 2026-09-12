import React from 'react';
import { Clock, ShieldAlert } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title }) => {
  return (
    <div className="p-12 text-center max-w-md mx-auto space-y-4">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto border border-slate-200">
        <Clock className="w-6 h-6 text-slate-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title} Module</h3>
      <p className="text-xs text-slate-500 leading-relaxed">
        This analytical module is scheduled for Phase 2 implementation. The Core Operations Map and Forensic Evidence Attribution Console are fully active.
      </p>
      <div className="pt-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-300 rounded-full text-xs font-semibold text-slate-700">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
          SpillGuard v1.0 Module
        </span>
      </div>
    </div>
  );
};
