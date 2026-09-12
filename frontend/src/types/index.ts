export interface DetectionCandidate {
  id: string;
  bbox: { x: number; y: number; w: number; h: number };
  probability: number;
  label: 'high' | 'medium' | 'low';
}

export interface DetectionResponse {
  overall_probability: number;
  candidates: DetectionCandidate[];
  annotated_image_url: string;
  opencv_candidate_count: number;
  ai_confirmed_count: number;
}

export interface SARScene {
  scene_id: string;
  label: string;
  status: 'detected' | 'out_of_zone' | 'clear';
  maritime_window: string;
  scene_time: string;
  filename: string;
  image_url: string;
  slick_lat: number;
  slick_lon: number;
}

export interface AISWaypoint {
  t: string;
  hours_offset: string;
  lat: number;
  lon: number;
  sog: number;
  cog: number;
}

export interface AISVessel {
  mmsi: string;
  name: string;
  type: string;
  risk_weight: number;
  cpa_lat: number;
  cpa_lon: number;
  track: AISWaypoint[];
}

export interface SubScores {
  spatial: number;
  temporal: number;
  trajectory: number;
  source_probability: number;
  behavioural: number;
  ais_continuity: number;
}

export interface SuspectLead {
  rank: number;
  mmsi: string;
  name: string;
  type: string;
  overall_score: number;
  distance_km: number;
  time_diff_hours: number;
  scores: SubScores;
  supporting_evidence: string[];
  contradicting_evidence: string[];
  explanation: string;
  track: AISWaypoint[];
}
