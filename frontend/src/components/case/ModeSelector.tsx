import React from 'react';
import { Cpu, Upload } from 'lucide-react';

interface ModeSelectorProps {
  mode: 'automatic' | 'upload';
  setMode: (mode: 'automatic' | 'upload') => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, setMode }) => {
  return (
    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/80 rounded-lg border border-slate-300/60 mb-4">
      <button
        onClick={() => setMode('automatic')}
        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
          mode === 'automatic'
            ? 'bg-white text-blue-900 shadow-sm border border-slate-300/80'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Cpu className="w-3.5 h-3.5 text-blue-600" />
        Automatic Ingestion
      </button>

      <button
        onClick={() => setMode('upload')}
        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
          mode === 'upload'
            ? 'bg-white text-blue-900 shadow-sm border border-slate-300/80'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Upload className="w-3.5 h-3.5 text-blue-600" />
        Upload Scene
      </button>
    </div>
  );
};
