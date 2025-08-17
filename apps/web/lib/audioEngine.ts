// apps/web/lib/audioEngine.ts
let ctx: AudioContext | null = null;
let playing = false;
let nodes: AudioNode[] = [];

// iOS audio unlock function
export function unlockAudio() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ac = (window as any).__ac || new (window.AudioContext || (window as any).webkitAudioContext)();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__ac = ac;
  const b = ac.createBuffer(1, 1, 22050); 
  const s = ac.createBufferSource(); 
  s.buffer = b; 
  s.connect(ac.destination);
  if (ac.state === "suspended") ac.resume();
  s.start(0);
}

export type MusicSpec = {
  tempo: number; // BPM
  key: string;   // "C major", etc. (not used yet)
  scale: string; // e.g. "aeolian" (not used yet)
  layers: { instrument: string; pattern: string }[];
};

function ensureCtx() {
  if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  return ctx!;
}

function makeClick(time: number, gain = 0.4) {
  const ac = ensureCtx();
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "square";
  o.frequency.value = 880; // click
  g.gain.value = gain;
  o.connect(g).connect(ac.destination);
  o.start(time);
  o.stop(time + 0.03);
  nodes.push(o, g);
}

function makeKick(time: number) {
  const ac = ensureCtx();
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(150, time);
  o.frequency.exponentialRampToValueAtTime(50, time + 0.15);
  g.gain.setValueAtTime(0.9, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
  o.connect(g).connect(ac.destination);
  o.start(time);
  o.stop(time + 0.16);
  nodes.push(o, g);
}

function makeHat(time: number) {
  const ac = ensureCtx();
  const n = ac.createBufferSource();
  const buffer = ac.createBuffer(1, ac.sampleRate * 0.05, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const hp = ac.createBiquadFilter();
  hp.type = "highpass"; hp.frequency.value = 8000;
  const g = ac.createGain(); g.gain.value = 0.3;
  n.buffer = buffer;
  n.connect(hp).connect(g).connect(ac.destination);
  n.start(time);
  nodes.push(n, hp, g);
}

function schedulePattern(pattern: string, start: number, beatSec: number, fn: (t:number)=>void) {
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === "x") {
      const t = start + i * beatSec / 4; // 16-step pattern per bar
      fn(t);
    }
  }
}

export function play(spec: MusicSpec) {
  if (playing) return;
  const ac = ensureCtx();
  playing = true;

  const bpm = spec.tempo || 100;
  const beatSec = 60 / bpm; // quarter note
  const start = ac.currentTime + 0.1;

  // Always schedule a click track quietly so we can confirm tempo
  schedulePattern("x...x...x...x...", start, beatSec, (t) => makeClick(t, 0.1));

  for (const layer of spec.layers || []) {
    const pat = (layer.pattern || "").toLowerCase();
    if (!pat) continue;

    if (layer.instrument === "kick") {
      schedulePattern(pat, start, beatSec, makeKick);
    } else if (layer.instrument === "hat" || layer.instrument === "drums") {
      schedulePattern(pat, start, beatSec, makeHat);
    } else {
      // default: gentle clicks so every spec is audible
      schedulePattern(pat, start, beatSec, (t) => makeClick(t, 0.2));
    }
  }
}

export function stop() {
  if (!ctx) return;
  playing = false;
  try { nodes.forEach((n: AudioNode) => (n as unknown as { stop?: () => void }).stop?.()); } catch {}
  nodes = [];
}

export function isPlaying() {
  return playing;
}
