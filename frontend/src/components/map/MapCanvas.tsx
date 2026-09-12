import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup, Rectangle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ActiveLayersPanel } from './ActiveLayersPanel';
import { AISVessel, SuspectLead } from '../../types';

// Fix Leaflet icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to re-center map when scene coordinates change
function MapRecenter({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 9);
  }, [lat, lon, map]);
  return null;
}

interface MapCanvasProps {
  centerLat?: number;
  centerLon?: number;
  slickLat?: number;
  slickLon?: number;
  vessels?: AISVessel[] | SuspectLead[];
  detectionConfidence?: number;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  slickLat = 18.9500,
  slickLon = 72.4000,
  vessels = [],
  detectionConfidence = 0.976,
}) => {
  const [layers, setLayers] = useState({
    eez: true,
    sar: true,
    slick: true,
    hindcast: true,
    forecast: true,
    ais: true,
  });

  const [isLayersOpen, setIsLayersOpen] = useState(true);

  const toggleLayer = (layerName: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  // Coordinates centered in open ocean (Arabian Sea / Offshore Mumbai)
  const sarBounds: [number, number][] = [
    [slickLat - 0.15, slickLon - 0.20],
    [slickLat + 0.15, slickLon + 0.20],
  ];

  const slickPolygon: [number, number][] = [
    [slickLat - 0.02, slickLon - 0.03],
    [slickLat + 0.01, slickLon - 0.01],
    [slickLat + 0.03, slickLon + 0.02],
    [slickLat + 0.01, slickLon + 0.04],
    [slickLat - 0.02, slickLon + 0.02],
  ];

  // Hindcast backward drift rings
  const hindcastRing1: [number, number][] = [
    [slickLat - 0.04, slickLon - 0.05],
    [slickLat + 0.03, slickLon - 0.03],
    [slickLat + 0.05, slickLon + 0.04],
    [slickLat - 0.03, slickLon + 0.05],
  ];

  const hindcastRing2: [number, number][] = [
    [slickLat - 0.07, slickLon - 0.08],
    [slickLat + 0.05, slickLon - 0.05],
    [slickLat + 0.08, slickLon + 0.07],
    [slickLat - 0.05, slickLon + 0.08],
  ];

  // India EEZ Jurisdiction Box
  const eezBounds: [number, number][] = [
    [6.0, 68.0],
    [23.0, 78.0],
  ];

  return (
    <div className="relative w-full h-[540px] rounded-lg overflow-hidden border border-slate-300 shadow-md">
      {/* Floating Active Layers Control */}
      <ActiveLayersPanel
        layers={layers}
        toggleLayer={toggleLayer}
        isOpen={isLayersOpen}
        setIsOpen={setIsLayersOpen}
      />

      {/* Top Right Synthetic AIS / Demo Badge */}
      <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-lg flex items-center gap-2 border border-slate-700">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        <span>Synthetic AIS / Demo</span>
        <span className="text-[10px] text-slate-400 font-mono border-l border-slate-700 pl-2">
          OpenStreetMap
        </span>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={[slickLat, slickLon]}
        zoom={9}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapRecenter lat={slickLat} lon={slickLon} />

        {/* Free OpenStreetMap Light Tile Layer (No API Key Required) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* EEZ Jurisdiction Layer */}
        {layers.eez && (
          <Rectangle
            bounds={eezBounds}
            pathOptions={{ color: '#1e293b', weight: 1.5, dashArray: '8, 8', fill: false }}
          />
        )}

        {/* SAR Footprint Layer */}
        {layers.sar && (
          <Rectangle
            bounds={sarBounds}
            pathOptions={{ color: '#0284c7', weight: 2.5, fillOpacity: 0.05 }}
          />
        )}

        {/* Hindcast Backward Euler Drift Layer */}
        {layers.hindcast && (
          <>
            <Polygon
              positions={hindcastRing1}
              pathOptions={{ color: '#ef4444', weight: 1.5, dashArray: '4, 4', fillOpacity: 0.1 }}
            />
            <Polygon
              positions={hindcastRing2}
              pathOptions={{ color: '#dc2626', weight: 1.5, dashArray: '6, 6', fillOpacity: 0.05 }}
            />
          </>
        )}

        {/* Slick Detection Polygon Layer */}
        {layers.slick && (
          <Polygon
            positions={slickPolygon}
            pathOptions={{
              color: detectionConfidence >= 0.75 ? '#d90429' : '#f77f00',
              fillColor: detectionConfidence >= 0.75 ? '#d90429' : '#f77f00',
              fillOpacity: 0.5,
              weight: 2,
            }}
          >
            <Popup>
              <div className="p-1 text-xs">
                <p className="font-bold text-red-900">Oil Slick Detection Mask</p>
                <p className="text-slate-700">Confidence: {(detectionConfidence * 100).toFixed(1)}%</p>
              </div>
            </Popup>
          </Polygon>
        )}

        {/* AIS Vessel Tracks & Pins */}
        {layers.ais &&
          vessels.map((vessel, idx) => {
            const trackCoords: [number, number][] = vessel.track.map((pt) => [pt.lat, pt.lon]);
            const isRank1 = (vessel as any).rank === 1 || idx === 0;

            return (
              <React.Fragment key={vessel.mmsi || idx}>
                {/* Track Polyline */}
                {trackCoords.length > 0 && (
                  <Polyline
                    positions={trackCoords}
                    pathOptions={{
                      color: isRank1 ? '#d90429' : '#2563eb',
                      weight: isRank1 ? 3 : 2,
                      dashArray: isRank1 ? undefined : '5, 5',
                    }}
                  />
                )}

                {/* Waypoint Markers */}
                {vessel.track.map((pt, wIdx) => (
                  <Marker key={wIdx} position={[pt.lat, pt.lon]}>
                    <Popup>
                      <div className="p-1 text-xs">
                        <p className="font-bold">{vessel.name}</p>
                        <p className="text-slate-600 font-mono">MMSI: {vessel.mmsi}</p>
                        <p className="text-slate-500">Time: {pt.t}</p>
                        <p className="text-slate-500">Speed: {pt.sog} knots</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </React.Fragment>
            );
          })}
      </MapContainer>
    </div>
  );
};
