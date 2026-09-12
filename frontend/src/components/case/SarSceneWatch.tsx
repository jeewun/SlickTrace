import React from 'react';
import { Eye, Ship, CheckCircle2, AlertCircle, Slash } from 'lucide-react';
import { SARScene, SuspectLead } from '../../types';

interface SarSceneWatchProps {
  scenes: SARScene[];
  selectedScene: SARScene | null;
  onSelectScene: (scene: SARScene) => void;
  topLead?: SuspectLead | null;
}

export const SarSceneWatch: React.FC<SarSceneWatchProps> = ({
  scenes,
  selectedScene,
  onSelectScene,
  topLead,
}) => {
  return (
    <div className="space-y-4">
      {/* SAR Scene Watch Box */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            SAR Scene Watch
          </h3>
        </div>

        <div className="mt-2.5 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Maritime window</span>
            <span className="font-semibold text-slate-800">India EEZ</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Current scene</span>
            <span className="font-mono font-semibold text-slate-800">
              {selectedScene?.scene_id || 'S1C_20260824T142210'}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Scene time</span>
            <span className="font-medium text-slate-700">
              {selectedScene?.scene_time || '24 Aug 2026 14:22 IST'}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Running stage</span>
            <span className="font-semibold text-blue-700">Ranking complete</span>
          </div>
        </div>

        {/* Preset Scene List */}
        <div className="mt-3.5 space-y-2">
          {scenes.map((scene) => {
            const isSelected = selectedScene?.scene_id === scene.scene_id;
            return (
              <button
                key={scene.scene_id}
                onClick={() => onSelectScene(scene)}
                className={`w-full text-left p-2.5 rounded-md border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-red-500 bg-red-50/40 ring-1 ring-red-400'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-mono text-xs font-bold text-slate-900">
                    {scene.scene_id}
                  </div>
                  <div className="text-[11px] font-semibold mt-0.5 flex items-center gap-1">
                    {scene.status === 'detected' && (
                      <span className="text-red-700 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-red-600" />
                        {scene.label}
                      </span>
                    )}
                    {scene.status === 'out_of_zone' && (
                      <span className="text-slate-500 flex items-center gap-1">
                        <Slash className="w-3 h-3 text-slate-400" />
                        {scene.label}
                      </span>
                    )}
                    {scene.status === 'clear' && (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {scene.label}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Suspect 1 Mini Preview Card */}
        {topLead && (
          <div className="mt-3 p-3 bg-red-50/70 border border-red-200 rounded-md text-xs">
            <div className="font-bold text-red-900 flex items-center gap-1.5">
              <Ship className="w-3.5 h-3.5 text-red-700" />
              Suspect 1: {topLead.name}
            </div>
            <div className="text-[11px] text-red-700 font-mono mt-0.5">
              MMSI {topLead.mmsi} — score {topLead.overall_score}
            </div>
          </div>
        )}
      </div>

      {/* Workflow Footer */}
      <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-md text-[11px] text-slate-600 flex justify-between items-center">
        <span className="font-semibold text-slate-700">WORKFLOW</span>
        <span className="font-bold text-slate-900">Manual review mode 100%</span>
      </div>
    </div>
  );
};
