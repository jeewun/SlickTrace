import React, { useState } from 'react';
import { CaseHeader } from '../components/case/CaseHeader';
import { ModeSelector } from '../components/case/ModeSelector';
import { SarSceneWatch } from '../components/case/SarSceneWatch';
import { MapCanvas } from '../components/map/MapCanvas';
import { StageTracker } from '../components/workflow/StageTracker';
import { TransparentMetrics } from '../components/workflow/TransparentMetrics';
import { TopVesselLeads } from '../components/vessels/TopVesselLeads';
import { SARScene, SuspectLead, DetectionResponse } from '../types';
import { detectSlick } from '../api/client';
import { UploadCloud, CheckCircle, RefreshCw } from 'lucide-react';

interface OperationsPageProps {
  scenes: SARScene[];
  selectedScene: SARScene | null;
  onSelectScene: (scene: SARScene) => void;
  leads: SuspectLead[];
  selectedLead: SuspectLead | null;
  onSelectLead: (lead: SuspectLead) => void;
  onNavigateToEvidence: () => void;
}

export const OperationsPage: React.FC<OperationsPageProps> = ({
  scenes,
  selectedScene,
  onSelectScene,
  leads,
  selectedLead,
  onSelectLead,
  onNavigateToEvidence,
}) => {
  const [mode, setMode] = useState<'automatic' | 'upload'>('automatic');
  const [uploadResult, setUploadResult] = useState<DetectionResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const res = await detectSlick(file, 'percentile');
      setUploadResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const topLead = leads[0] || null;

  return (
    <div className="p-6 grid grid-cols-12 gap-6 max-w-[1700px] mx-auto">
      {/* LEFT COLUMN: Case & Ingestion */}
      <div className="col-span-3 space-y-4">
        <CaseHeader />
        <ModeSelector mode={mode} setMode={setMode} />

        {mode === 'automatic' ? (
          <SarSceneWatch
            scenes={scenes}
            selectedScene={selectedScene}
            onSelectScene={onSelectScene}
            topLead={topLead}
          />
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Upload Local SAR Scene
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload any satellite SAR image (PNG/JPG) for instant PyTorch MobileNetV3 slick detection.
            </p>

            <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-blue-50/40 transition-all">
              <UploadCloud className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-xs font-bold text-slate-800">Click to choose SAR image</span>
              <span className="text-[11px] text-slate-500 mt-0.5">Supports PNG, JPG, JPEG</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            {isProcessing && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-800 flex items-center justify-center gap-2 font-medium">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>Processing PyTorch inference & OpenCV extraction...</span>
              </div>
            )}

            {uploadResult && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2 text-xs">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>Overall Confidence:</span>
                  <span className="font-mono text-red-600">
                    {(uploadResult.overall_probability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>OpenCV Candidates:</span>
                  <span className="font-bold text-slate-800">{uploadResult.opencv_candidate_count}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>AI Confirmed Sub-Slicks:</span>
                  <span className="font-bold text-red-600">{uploadResult.ai_confirmed_count}</span>
                </div>
                <img
                  src={uploadResult.annotated_image_url}
                  alt="Detection result"
                  className="w-full h-auto rounded border border-slate-300 mt-2"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* CENTER COLUMN: Map Canvas */}
      <div className="col-span-6 space-y-4">
        <MapCanvas
          slickLat={selectedScene?.slick_lat || 25.2048}
          slickLon={selectedScene?.slick_lon || 55.2708}
          vessels={leads}
          detectionConfidence={uploadResult ? uploadResult.overall_probability : 0.976}
        />
      </div>

      {/* RIGHT COLUMN: Workflow & Metrics */}
      <div className="col-span-3 space-y-4">
        <StageTracker />
        <TransparentMetrics />
        <TopVesselLeads
          leads={leads}
          selectedLead={selectedLead}
          onSelectLead={(lead) => {
            onSelectLead(lead);
            onNavigateToEvidence();
          }}
        />
      </div>
    </div>
  );
};
