import React from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';

interface StageTrackerProps {
  stageName?: string;
}

export const StageTracker: React.FC<StageTrackerProps> = ({
  stageName = "Transparent suspect ranking",
}) => {
  const stages = ['Intake', 'Detection', 'Drift', 'AIS', 'Ranking', 'Explanation'];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            CURRENT STAGE
          </span>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            {stageName}
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300 uppercase">
              READY
            </span>
          </h4>
        </div>
      </div>

      {/* Stage Stepper */}
      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-100">
        {stages.map((s, idx) => (
          <React.Fragment key={s}>
            <span className={`flex items-center gap-0.5 ${s === 'Ranking' || s === 'Explanation' ? 'text-blue-700 font-extrabold' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {s}
            </span>
            {idx < stages.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300" />}
          </React.Fragment>
        ))}
      </div>

      {/* Explanation Ready Box */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1.5">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <span>🧠 Explanation ready</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          The LLM explains the ordered vessel leads using the same metrics shown to the investigator.
        </p>
      </div>
    </div>
  );
};
