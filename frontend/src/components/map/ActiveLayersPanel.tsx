import React from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';

interface ActiveLayersPanelProps {
  layers: {
    eez: boolean;
    sar: boolean;
    slick: boolean;
    hindcast: boolean;
    forecast: boolean;
    ais: boolean;
  };
  toggleLayer: (layerName: keyof ActiveLayersPanelProps['layers']) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const ActiveLayersPanel: React.FC<ActiveLayersPanelProps> = ({
  layers,
  toggleLayer,
  isOpen,
  setIsOpen,
}) => {
  return (
    <div className="absolute top-4 left-4 z-[1000] w-64 bg-white/95 backdrop-blur-sm border border-slate-300 rounded-lg shadow-lg text-xs overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 bg-slate-900 text-white font-semibold flex items-center justify-between hover:bg-slate-800 transition-colors"
      >
        <span className="flex items-center gap-1.5 font-bold tracking-wide">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          Active Layers
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="p-2.5 space-y-1.5 bg-white">
          {[
            { key: 'eez', label: 'EEZ', desc: 'Jurisdiction window' },
            { key: 'sar', label: 'SAR', desc: 'Scene footprint' },
            { key: 'slick', label: 'Slick', desc: 'Detection mask' },
            { key: 'hindcast', label: 'Hindcast', desc: 'Backward Euler drift' },
            { key: 'forecast', label: 'Forecast', desc: '50 / 80 / 95 contours' },
            { key: 'ais', label: 'AIS', desc: 'Tracks and vessel pins' },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layers[item.key as keyof typeof layers]}
                  onChange={() => toggleLayer(item.key as keyof typeof layers)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span className="font-bold text-slate-800">{item.label}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{item.desc}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
