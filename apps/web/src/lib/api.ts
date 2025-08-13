const API = process.env.NEXT_PUBLIC_API_URL!;
if (!API) throw new Error('NEXT_PUBLIC_API_URL missing');

export async function getTodayChart() {
  const r = await fetch(`${API}/api/ephemeris/today`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`today failed: ${r.status}`);
  return r.json();
}

export async function generateAudio(payload: any) {
  const r = await fetch(`${API}/api/audio/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`generate failed: ${r.status}`);
  return r.json() as Promise<{ audioId: string }>;
}

export function streamUrl(audioId: string) {
  return `${API}/api/audio/stream/${audioId}`;
}
