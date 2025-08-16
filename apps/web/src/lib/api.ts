// apps/web/src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL!;
if (!API_BASE) {
  // Make failure obvious in prod too
  // eslint-disable-next-line no-console
  console.error('NEXT_PUBLIC_API_URL is not set');
}

export type ChartData = Record<string, unknown>;

function ymd(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

async function ok(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`.trim());
  }
  return res;
}

export async function fetchTodayChart(): Promise<ChartData> {
  const res = await fetch(`${API_BASE}/api/today`, { cache: 'no-store' });
  const checkedRes = await ok(res);
  return checkedRes.json();
}

/** Returns a Blob URL you can assign to <audio src>. */
export async function generateAudioUrl(input: {
  chartA: ChartData;
  mode?: 'personal' | 'compat';
  genre?: string;
  tempo?: number;
}): Promise<string> {
  const res = await fetch(`${API_BASE}/api/music/play`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // API expects a single-shot stream response; we feed it to the <audio> via Blob URL
    body: JSON.stringify({
      mode: input.mode ?? 'personal',
      chartA: input.chartA,
      genre: input.genre ?? 'ambient',
      tempo: input.tempo ?? 60,
    }),
  });
  const checkedRes = await ok(res);
  const blob = await checkedRes.blob();
  return URL.createObjectURL(blob);
}
