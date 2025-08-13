import { Router } from 'express';
import { Readable } from 'node:stream';

export const audioRouter = Router();

// Audio generation endpoint
audioRouter.post('/generate', (req, res) => {
  try {
    const { chartA, chartB, mode = 'personal', genre = 'ambient' } = req.body;
    
    if (!chartA) {
      return res.status(400).json({ error: 'chartA is required' });
    }
    
    // Generate a unique audio ID
    const audioId = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // For now, return the audio ID immediately
    // In a real implementation, this would queue the audio generation
    res.json({
      success: true,
      audioId,
      status: 'ready',
      mode,
      genre
    });
  } catch (error) {
    console.error('Audio generation error:', error);
    res.status(500).json({ error: 'Failed to generate audio' });
  }
});

// Optimized WAV header for fast streaming (PCM 16-bit mono)
function wavHeader(sampleRate: number, numSamples: number) {
  const blockAlign = 2;              // mono 16-bit
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buf = Buffer.alloc(44);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);         // PCM
  buf.writeUInt16LE(1, 20);          // PCM format
  buf.writeUInt16LE(1, 22);          // channels
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(byteRate, 28);
  buf.writeUInt16LE(blockAlign, 32);
  buf.writeUInt16LE(16, 34);         // bits
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  return buf;
}

// Enhanced streaming route with immediate playback optimization
audioRouter.get('/stream/:audioId', async (req, res) => {
  const { audioId } = req.params;

  // Ultra-fast settings for instant preview
  const sampleRate = 16000;          // lower SR = faster start, still clear
  const seconds = 15;                // shorter preview for faster loading
  const total = sampleRate * seconds;
  const chunk = 512;                 // smaller chunks for immediate response

  // Set headers for immediate streaming
  res.set({
    'Content-Type': 'audio/wav',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Connection': 'keep-alive',
    'Transfer-Encoding': 'chunked',
    'Access-Control-Expose-Headers': 'Content-Type',
    'X-Audio-ID': audioId
  });

  // Write header immediately so playback can start
  res.write(wavHeader(sampleRate, total));

  // Optimized audio generator with minimal latency
  const stream = Readable.from((async function* () {
    let i = 0;
    const startTime = Date.now();
    
    while (i < total) {
      const n = Math.min(chunk, total - i);
      const buf = Buffer.allocUnsafe(n * 2);
      
      for (let k = 0; k < n; k++) {
        const t = (i + k) / sampleRate;
        // Simple but effective tone generation
        const freq = 220 + Math.sin(t * 0.1) * 50; // varying frequency
        const s = Math.sin(2 * Math.PI * freq * t) * 0.2;
        buf.writeInt16LE((s * 0x7fff) | 0, k * 2);
      }
      
      i += n;
      yield buf;
      
      // Let the event loop breathe after each chunk
      await new Promise(r => setImmediate(r));
    }
    
    console.log(`🎵 Audio stream completed in ${Date.now() - startTime}ms`);
  })());

  // Error handling
  stream.on('error', (e) => {
    console.error('Audio stream error:', e);
    if (!res.headersSent) {
      res.status(500).json({ error: 'stream_failed' });
    } else {
      res.end();
    }
  });

  // Pipe to response
  stream.pipe(res);
});
