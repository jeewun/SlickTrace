import { DetectionResponse, SARScene, AISVessel, SuspectLead } from '../types';

export async function fetchScenes(): Promise<SARScene[]> {
  const res = await fetch('/api/v1/scenes');
  if (!res.ok) throw new Error('Failed to fetch scenes feed');
  return res.json();
}

export async function detectSlick(file: File, method: string = 'percentile'): Promise<DetectionResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('method', method);
  formData.append('min_area', '100');

  const res = await fetch('/api/v1/detect', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Failed to process image detection');
  return res.json();
}

export async function fetchSyntheticAIS(slick_lat: number, slick_lon: number): Promise<AISVessel[]> {
  const res = await fetch('/api/v1/ais/synthetic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slick_lat, slick_lon }),
  });

  if (!res.ok) throw new Error('Failed to fetch synthetic AIS tracks');
  return res.json();
}

export async function fetchSuspectRanking(
  slick_lat: number,
  slick_lon: number,
  vessels?: AISVessel[]
): Promise<SuspectLead[]> {
  const res = await fetch('/api/v1/attribution/rank', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slick_lat, slick_lon, vessels }),
  });

  if (!res.ok) throw new Error('Failed to fetch suspect vessel ranking');
  return res.json();
}
