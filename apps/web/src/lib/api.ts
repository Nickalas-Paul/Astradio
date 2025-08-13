// apps/web/src/lib/api.ts
import { fetchJSON } from './http';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://astradio-1.onrender.com';

export const getTodayChart = () =>
  fetchJSON(`${API}/api/ephemeris/today`);

export const generateAudio = (payload: any) =>
  fetchJSON(`${API}/api/audio/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const streamUrl = (id: string) =>
  `${API}/api/audio/stream/${id}?t=${Date.now()}`;
