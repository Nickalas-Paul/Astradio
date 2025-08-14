'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchTodayChart, generateAudioUrl } from '@/lib/api';

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [status, setStatus] = useState<'idle'|'loading'|'ready'|'error'>('idle');
  const [genre, setGenre] = useState('ambient');
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setStatus('loading');
        // Parallel-friendly pattern, but we need chart first to build audio
        const chart = await fetchTodayChart();
        if (abort) return;
        const src = await generateAudioUrl({ chartA: chart, genre });
        if (abort) return;
        const a = audioRef.current!;
        a.preload = 'auto';
        a.src = src;
        setStatus('ready');
        // Try autoplay; browsers may block, our UI has a one-tap fallback
        a.play().catch(() => {});
      } catch (e: any) {
        setErr(e?.message ?? 'Failed to load');
        setStatus('error');
      }
    })();
    return () => { abort = true; };
  }, [genre]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold text-center">🎵 Astradio – Daily Chart Music</h1>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-xl bg-white/70 p-4">
          <h2 className="font-medium mb-2">Today's Chart</h2>
          {status === 'loading' && <p>Loading chart…</p>}
          {status === 'error' && <p className="text-red-600">Error: {err}</p>}
          {status === 'ready' && <p>Chart ready ✓</p>}
        </section>

        <section className="rounded-xl bg-white/70 p-4">
          <h2 className="font-medium mb-2">Music Player</h2>
          <input
            className="border rounded px-2 py-1 mb-3"
            placeholder="Genre (ambient, electronic, folk…)"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
              onClick={() => audioRef.current?.play()}
              disabled={status !== 'ready'}
              title={status !== 'ready' ? 'Preparing audio…' : 'Play'}
            >
              ▶ Play
            </button>
            <button
              className="px-4 py-2 rounded bg-gray-200"
              onClick={() => audioRef.current?.pause()}
            >
              ⏸ Pause
            </button>
          </div>
          <audio ref={audioRef} controls className="mt-3 w-full" playsInline crossOrigin="anonymous" />
        </section>
      </div>
    </main>
  );
}