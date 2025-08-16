import { AudioConfig, ChartData, PlanetPoint, Aspect } from '@astradio/shared';

// Deterministic RNG (Mulberry32)
class SeededRNG {
  private state: number;

  constructor(seed: string) {
    this.state = this.hashString(seed);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  next(): number {
    this.state = this.state + 0x6D2B79F5 | 0;
    let t = Math.imul(this.state ^ this.state >>> 15, 1 | this.state);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  nextRange(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.nextRange(min, max + 1));
  }
}

// Musical mapping functions
export function keyFromChart(chart: ChartData): string {
  // Use Sun's longitude to determine key
  const sun = chart.planets.find(p => p.name === 'Sun');
  if (!sun) return 'C';
  
  const keys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
  const keyIndex = Math.floor((sun.lon / 360) * 12);
  return keys[keyIndex % 12];
}

export function tempoFromMotion(chart: ChartData, genre: string): number {
  // Calculate mean planetary daily motion
  const speeds = chart.planets.map(p => Math.abs(p.speed));
  const meanSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  
  // Map to tempo ranges by genre
  const genreTempos: Record<string, [number, number]> = {
    ambient: [60, 90],
    techno: [120, 140],
    world: [80, 110],
    'hip-hop': [85, 95]
  };
  
  const [min, max] = genreTempos[genre] || [80, 120];
  return Math.max(min, Math.min(max, 60 + meanSpeed * 10));
}

export function scaleFromGenre(genre: string): number[] {
  // Return scale degrees (0-11) for each genre
  const scales: Record<string, number[]> = {
    ambient: [0, 2, 4, 7, 9, 11], // Major pentatonic
    techno: [0, 2, 4, 5, 7, 9, 11], // Natural minor
    world: [0, 2, 4, 5, 7, 9, 10], // Dorian
    'hip-hop': [0, 2, 4, 7, 9] // Minor pentatonic
  };
  
  return scales[genre] || [0, 2, 4, 7, 9, 11];
}

export function aspectWeights(chart: ChartData): number {
  // Calculate rhythm density from aspect counts
  const aspectCounts = chart.aspects.reduce((acc, aspect) => {
    acc[aspect.type] = (acc[aspect.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Weight by aspect type
  const weights: Record<string, number> = {
    conj: 1.0,
    opp: 0.8,
    trine: 0.6,
    square: 0.9,
    sextile: 0.5
  };
  
  return Object.entries(aspectCounts).reduce((total, [type, count]) => {
    return total + (count * (weights[type] || 0.5));
  }, 0);
}

// Simple synth kernels
class AudioEngine {
  private sampleRate: number;
  private rng: SeededRNG;

  constructor(sampleRate: number, seed: string) {
    this.sampleRate = sampleRate;
    this.rng = new SeededRNG(seed);
  }

  // Simple sine wave oscillator
  private sineWave(frequency: number, duration: number): Int16Array {
    const samples = Math.floor(duration * this.sampleRate);
    const buffer = new Int16Array(samples);
    
    for (let i = 0; i < samples; i++) {
      const t = i / this.sampleRate;
      buffer[i] = Math.floor(Math.sin(2 * Math.PI * frequency * t) * 16384);
    }
    
    return buffer;
  }

  // Additive synthesis with harmonics
  private additiveSynth(frequency: number, duration: number, harmonics: number[]): Int16Array {
    const samples = Math.floor(duration * this.sampleRate);
    const buffer = new Int16Array(samples);
    
    for (let i = 0; i < samples; i++) {
      const t = i / this.sampleRate;
      let sample = 0;
      
      harmonics.forEach((amplitude, index) => {
        const harmonicFreq = frequency * (index + 1);
        sample += amplitude * Math.sin(2 * Math.PI * harmonicFreq * t);
      });
      
      buffer[i] = Math.floor(sample * 8192); // Scale down to avoid clipping
    }
    
    return buffer;
  }

  // Generate a note based on planet data
  private generateNote(planet: PlanetPoint, genre: string, duration: number): Int16Array {
    const scale = scaleFromGenre(genre);
    const baseFreq = 220; // A3
    
    // Map planet longitude to scale degree
    const scaleIndex = Math.floor((planet.lon / 360) * scale.length);
    const semitones = scale[scaleIndex % scale.length];
    const frequency = baseFreq * Math.pow(2, semitones / 12);
    
    // Add some randomness based on planet speed
    const detune = (this.rng.next() - 0.5) * 0.1;
    const finalFreq = frequency * (1 + detune);
    
    // Choose harmonics based on planet
    const harmonics = [1, 0.5, 0.25, 0.125]; // Basic harmonic series
    
    return this.additiveSynth(finalFreq, duration, harmonics);
  }

  // Generate a frame of audio
  generateFrame(chart: ChartData, genre: string, frameDuration: number): Int16Array {
    const frameSamples = Math.floor(frameDuration * this.sampleRate);
    const frame = new Int16Array(frameSamples);
    
    // Mix all planet voices
    chart.planets.forEach(planet => {
      const note = this.generateNote(planet, genre, frameDuration);
      
      // Mix into frame (simple addition, could be improved with proper mixing)
      for (let i = 0; i < Math.min(frameSamples, note.length); i++) {
        frame[i] = Math.max(-32768, Math.min(32767, frame[i] + note[i]));
      }
    });
    
    return frame;
  }
}

// Main generator function
export async function* generateFrames(
  cfg: AudioConfig, 
  chart: ChartData, 
  chartB?: ChartData
): AsyncGenerator<Int16Array> {
  const seed = cfg.seed || `${JSON.stringify(cfg)}-${JSON.stringify(chart)}-${JSON.stringify(chartB || '')}`;
  const engine = new AudioEngine(cfg.sampleRate, seed);
  
  const frameDuration = 0.1; // 100ms frames
  const totalFrames = Math.ceil(cfg.durationSec / frameDuration);
  
  for (let i = 0; i < totalFrames; i++) {
    // For synastry, blend both charts
    if (chartB && cfg.mode === 'synastry') {
      // Simple cross-modulation for synastry
      const frameA = engine.generateFrame(chart, cfg.genre, frameDuration);
      const frameB = engine.generateFrame(chartB, cfg.genre, frameDuration);
      
      // Blend frames
      const blended = new Int16Array(frameA.length);
      for (let j = 0; j < frameA.length; j++) {
        blended[j] = Math.floor((frameA[j] + frameB[j]) / 2);
      }
      
      yield blended;
    } else {
      yield engine.generateFrame(chart, cfg.genre, frameDuration);
    }
  }
}

// WAV header generator
export function generateWavHeader(sampleRate: number, dataSize: number): Buffer {
  const buffer = Buffer.alloc(44);
  
  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  
  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  
  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  return buffer;
}