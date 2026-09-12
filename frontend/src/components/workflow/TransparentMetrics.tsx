import React from 'react';
import { Info, AlertTriangle } from 'lucide-react';

export const TransparentMetrics: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm space-y-3">
      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-blue-600" />
        Transparent Metrics
      </h4>

      <div className="space-y-1.5 text-xs text-slate-600">
        <div className="flex justify-between border-b border-slate-100 pb-1">
          <span>Model</span>
          <span className="font-semibold text-slate-900">Attribution LLM</span>
        </div>
        <div className="flex justify-between border-b border-slate-100 pb-1">
          <span>Score Inputs</span>
          <span className="font-medium text-slate-800 text-[11px]">Spatial, temporal, trajectory, behaviour, source, AIS continuity</span>
        </div>
        <div className="flex justify-between pb-1">
          <span>Output</span>
          <span className="font-semibold text-slate-900">Ranked investigative leads</span>
        </div>
      </div>

      {/* Mandatory Legal & Investigative Disclaimer Box */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 space-y-1">
        <div className="font-bold flex items-center gap-1 text-amber-800">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Investigative Disclaimer
        </div>
        <p className="text-[11px] leading-relaxed text-amber-900 font-medium">
          Rankings are investigative leads based on measured consistency and require investigator review.
        </p>
      </div>
    </div>
  );
};
