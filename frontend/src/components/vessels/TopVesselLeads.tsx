import React from 'react';
import { Ship, ChevronRight } from 'lucide-react';
import { SuspectLead } from '../../types';

interface TopVesselLeadsProps {
  leads: SuspectLead[];
  selectedLead: SuspectLead | null;
  onSelectLead: (lead: SuspectLead) => void;
}

export const TopVesselLeads: React.FC<TopVesselLeadsProps> = ({
  leads,
  selectedLead,
  onSelectLead,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
          <Ship className="w-3.5 h-3.5 text-blue-600" />
          Top 3 Vessel Leads
        </h4>
        <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-full border border-red-200 uppercase">
          High attention
        </span>
      </div>

      <div className="space-y-2">
        {leads.slice(0, 3).map((lead) => {
          const isSelected = selectedLead?.mmsi === lead.mmsi;
          return (
            <button
              key={lead.mmsi}
              onClick={() => onSelectLead(lead)}
              className={`w-full p-2.5 rounded-md border text-left transition-all flex items-center justify-between ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-400'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  lead.rank === 1 ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  #{lead.rank}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    {lead.name}
                    <span className="text-[10px] font-normal text-slate-500 font-mono">
                      {lead.mmsi}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {lead.type} • {lead.distance_km} km away
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-slate-900 font-mono">
                  {lead.overall_score}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
