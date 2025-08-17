"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioRouter = void 0;
const express_1 = require("express");
const node_stream_1 = require("node:stream");
exports.audioRouter = (0, express_1.Router)();
// Audio generation endpoint
exports.audioRouter.post('/generate', (req, res) => {
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
    }
    catch (error) {
        console.error('Audio generation error:', error);
        res.status(500).json({ error: 'Failed to generate audio' });
    }
});
// Optimized WAV header for fast streaming (PCM 16-bit mono)
function wavHeader(sampleRate, numSamples) {
    const blockAlign = 2; // mono 16-bit
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * blockAlign;
    const buf = Buffer.alloc(44);
    buf.write('RIFF', 0);
    buf.writeUInt32LE(36 + dataSize, 4);
    buf.write('WAVE', 8);
    buf.write('fmt ', 12);
    buf.writeUInt32LE(16, 16); // PCM
    buf.writeUInt16LE(1, 20); // PCM format
    buf.writeUInt16LE(1, 22); // channels
    buf.writeUInt32LE(sampleRate, 24);
    buf.writeUInt32LE(byteRate, 28);
    buf.writeUInt16LE(blockAlign, 32);
    buf.writeUInt16LE(16, 34); // bits
    buf.write('data', 36);
    buf.writeUInt32LE(dataSize, 40);
    return buf;
}
// Convert planet longitude to frequency (astrological music mapping)
function planetToFrequency(planet, longitude) {
    // Base frequencies for each planet
    const planetFrequencies = {
        'Sun': 261.63, // C4
        'Moon': 293.66, // D4
        'Mercury': 329.63, // E4
        'Venus': 349.23, // F4
        'Mars': 392.00, // G4
        'Jupiter': 440.00, // A4
        'Saturn': 493.88, // B4
        'Uranus': 523.25, // C5
        'Neptune': 587.33, // D5
        'Pluto': 659.25 // E5
    };
    const baseFreq = planetFrequencies[planet] || 440;
    // Modulate frequency based on longitude (0-360 degrees)
    const modulation = 1 + (longitude / 360) * 0.5; // ±50% variation
    return baseFreq * modulation;
}
// Generate astrological music based on chart data
function generateAstrologicalAudio(planets, sampleRate, duration) {
    const totalSamples = sampleRate * duration;
    const chunkSize = 512;
    return node_stream_1.Readable.from((async function* () {
        let sampleIndex = 0;
        while (sampleIndex < totalSamples) {
            const chunk = Math.min(chunkSize, totalSamples - sampleIndex);
            const buffer = Buffer.allocUnsafe(chunk * 2);
            for (let i = 0; i < chunk; i++) {
                const time = (sampleIndex + i) / sampleRate;
                let sample = 0;
                // Mix all planets based on their positions
                Object.entries(planets).forEach(([planetName, planetData]) => {
                    const freq = planetToFrequency(planetName, planetData.longitude);
                    const amplitude = 0.1; // Reduce amplitude for mixing
                    const phase = (planetData.longitude / 360) * 2 * Math.PI;
                    // Add planet's contribution to the mix
                    sample += amplitude * Math.sin(2 * Math.PI * freq * time + phase);
                });
                // Clamp and convert to 16-bit
                sample = Math.max(-1, Math.min(1, sample));
                buffer.writeInt16LE(Math.round(sample * 0x7fff), i * 2);
            }
            sampleIndex += chunk;
            yield buffer;
            // Let the event loop breathe
            await new Promise(r => setImmediate(r));
        }
    })());
}
// Enhanced streaming route with astrological audio generation
exports.audioRouter.get('/stream/:audioId', async (req, res) => {
    const { audioId } = req.params;
    // Get the chart data from the generate endpoint (in a real app, this would be stored)
    // For now, we'll generate a sample chart based on current planetary positions
    const samplePlanets = {
        'Sun': { longitude: 141.47, sign: { name: 'Leo' } },
        'Moon': { longitude: 22.08, sign: { name: 'Aries' } },
        'Mercury': { longitude: 124.67, sign: { name: 'Leo' } },
        'Venus': { longitude: 106.15, sign: { name: 'Cancer' } },
        'Mars': { longitude: 184.40, sign: { name: 'Libra' } },
        'Jupiter': { longitude: 104.42, sign: { name: 'Cancer' } },
        'Saturn': { longitude: 1.11, sign: { name: 'Aries' } },
        'Uranus': { longitude: 61.24, sign: { name: 'Gemini' } },
        'Neptune': { longitude: 1.77, sign: { name: 'Aries' } },
        'Pluto': { longitude: 302.14, sign: { name: 'Aquarius' } }
    };
    const sampleRate = 22050; // Higher quality
    const duration = 30; // 30 seconds
    const totalSamples = sampleRate * duration;
    // Set headers for streaming
    res.set({
        'Content-Type': 'audio/wav',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Connection': 'keep-alive',
        'Transfer-Encoding': 'chunked',
        'Access-Control-Expose-Headers': 'Content-Type',
        'X-Audio-ID': audioId
    });
    // Write WAV header
    res.write(wavHeader(sampleRate, totalSamples));
    // Generate astrological audio stream
    const audioStream = generateAstrologicalAudio(samplePlanets, sampleRate, duration);
    // Error handling
    audioStream.on('error', (e) => {
        console.error('Audio stream error:', e);
        if (!res.headersSent) {
            res.status(500).json({ error: 'stream_failed' });
        }
        else {
            res.end();
        }
    });
    // Pipe to response
    audioStream.pipe(res);
});
//# sourceMappingURL=audio.js.map