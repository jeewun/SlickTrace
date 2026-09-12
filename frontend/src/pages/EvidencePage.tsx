import React from 'react';
import { EvidenceBreakdown } from '../components/evidence/EvidenceBreakdown';
import { SuspectLead } from '../types';
import { ArrowLeft } from 'lucide-react';

interface EvidencePageProps {
  selectedLead: SuspectLead | null;
  onBackToMap: () => void;
}

export const EvidencePage: React.FC<EvidencePageProps> = ({ selectedLead, onBackToMap }) => {
  if (!selectedLead) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>No suspect vessel selected.</p>
        <button
          onClick={onBackToMap}
          className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-md shadow"
        >
          Return to Operations Map
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-4">
      <button
        onClick={onBackToMap}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Operations Console
      </button>

      <EvidenceBreakdown lead={selectedLead} />
    </div>
  );
};
