import { Router, Request, Response } from 'express';

const router = Router();

router.get('/stream/:audioId', async (req: Request, res: Response) => {
  // TODO: fetch audio params by audioId (from generator output).
  // Demo placeholders (replace with generator-driven values):
  const durationSec = 30;
  const sampleRate = 48000;
  const channels = 1;
  const bitsPerSample = 16;
  const freq = 440;
  const amplitude = 0.2;

  res.set({
    'Content-Type': 'audio/wav',
    'Transfer-Encoding': 'chunked',
    'Cache-Control': 'no-store',
    'Accept-Ranges': 'none',
  });

  // --- WAV header with size placeholders (OK for streaming) ---
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);
  const hdr = Buffer.alloc(44);
  hdr.write('RIFF', 0);
  hdr.writeUInt32LE(0xffffffff, 4);
  hdr.write('WAVE', 8);
  hdr.write('fmt ', 12);
  hdr.writeUInt32LE(16, 16);
  hdr.writeUInt16LE(1, 20); // PCM
  hdr.writeUInt16LE(channels, 22);
  hdr.writeUInt32LE(sampleRate, 24);
  hdr.writeUInt32LE(byteRate, 28);
  hdr.writeUInt16LE(blockAlign, 32);
  hdr.writeUInt16LE(bitsPerSample, 34);
  hdr.write('data', 36);
  hdr.writeUInt32LE(0xffffffff, 40);
  res.write(hdr);

  // --- Stream PCM with backpressure ---
  const CHUNK_FRAMES = 4096;
  const totalFrames = durationSec * sampleRate;
  let i = 0;

  while (i < totalFrames) {
    const n = Math.min(CHUNK_FRAMES, totalFrames - i);
    const buf = Buffer.allocUnsafe(n * 2); // 16-bit mono
    for (let j = 0; j < n; j++) {
      const t = i + j;
      const sample = Math.sin((2 * Math.PI * freq * t) / sampleRate) * amplitude;
      buf.writeInt16LE((sample * 32767) | 0, j * 2);
    }
    if (!res.write(buf)) await new Promise<void>((r) => res.once('drain', r));
    i += n;
  }

  res.end();
});

export default router;
