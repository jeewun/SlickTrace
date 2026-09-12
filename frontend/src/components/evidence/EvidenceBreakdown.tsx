import React from 'react';
import { CheckCircle2, AlertTriangle, Cpu, Info } from 'lucide-react';
import { SuspectLead } from '../../types';

interface EvidenceBreakdownProps {
  lead: SuspectLead;
}

export const EvidenceBreakdown: React.FC<EvidenceBreakdownProps> = ({ lead }) => {
  const { scores } = lead;

  const subScoreItems = [
    { label: 'Spatial', val: scores.spatial, col: 'bg-blue-900' },
    { label: 'Temporal', val: scores.temporal, col: 'bg-blue-700' },
    { label: 'Trajectory', val: scores.trajectory, col: 'bg-blue-600' },
    { label: 'Source probability', val: scores.source_probability, col: 'bg-slate-600' },
    { label: 'Behavioural', val: scores.behavioural, col: 'bg-slate-500' },
    { label: 'AIS continuity', val: scores.ais_continuity, col: 'bg-slate-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="p-3 bg-slate-100 border border-slate-200 rounded-md text-xs text-slate-700 flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />
        <span>AIS vessel traffic is labelled by source and separated from other evidence layers</span>
      </div>

      {/* Main Score Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              #{lead.rank} {lead.name}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              MMSI {lead.mmsi} • {lead.type}
            </p>
          </div>

          <div className="text-right">
            <span className="text-4xl font-black text-slate-900 font-mono">
              {lead.overall_score}
            </span>
            <p className="text-[11px] text-slate-500 leading-tight max-w-[220px] mt-1 font-medium">
              Degree of spatio-temporal and behavioural consistency with the reconstructed spill source — an investigative lead, not a determination of guilt.
            </p>
          </div>
        </div>

        {/* Segmented Horizontal Sub-Score Bar (Matching Screenshot 3) */}
        <div>
          <div className="flex h-3 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
            {subScoreItems.map((item) => (
              <div
                key={item.label}
                className={`${item.col} transition-all border-r border-white/20`}
                style={{ width: `${100 / subScoreItems.length}%` }}
                title={`${item.label}: ${item.val}`}
              />
            ))}
          </div>

          {/* Sub-Score Labels & Numbers Grid */}
          <div className="grid grid-cols-6 gap-2 mt-3 text-center">
            {subScoreItems.map((item) => (
              <div key={item.label} className="p-1.5 bg-slate-50 rounded border border-slate-100">
                <p className="text-[10px] text-slate-500 font-medium truncate">{item.label}</p>
                <p className="text-sm font-bold text-slate-900 font-mono mt-0.5">{item.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-Side Supporting vs Contradicting Evidence */}
      <div className="grid grid-cols-2 gap-6">
        {/* Supporting Evidence */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Supporting evidence
          </h4>

          <ul className="space-y-2">
            {lead.supporting_evidence.map((ev, idx) => (
              <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span>{ev}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contradicting Evidence */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Contradicting evidence
          </h4>

          <ul className="space-y-2">
            {lead.contradicting_evidence.map((ev, idx) => (
              <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                <span className="text-amber-600 font-bold mt-0.5">⚠️</span>
                <span>{ev}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI-Generated Explanation Card */}
      <div className="bg-slate-900 text-white rounded-lg p-5 shadow-md space-y-2 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
          <Cpu className="w-4 h-4 text-blue-400" />
          AI-generated explanation of the scores above
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
          {lead.explanation}
        </p>

        <p className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800">
          AI-generated explanation of the scores above — always shown alongside the underlying evidence, never in place of it.
        </p>
      </div>
    </div>
  );
};
