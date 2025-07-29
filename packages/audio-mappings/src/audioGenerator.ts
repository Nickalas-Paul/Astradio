// Audio Generator for Astradio Backend
// Generates actual audio files or streams for astrological compositions

import { AstroChart } from '@astradio/types';

export interface AudioNote {
  frequency: number;
  duration: number;
  volume: number;
  instrument: string;
  startTime: number;
}

export interface AudioComposition {
  notes: AudioNote[];
  duration: number;
  sampleRate: number;
  format: 'wav' | 'mp3' | 'ogg';
}

// Simple sine wave generator for Node.js
class SineWaveGenerator {
  private sampleRate: number;

  constructor(sampleRate: number = 44100) {
    this.sampleRate = sampleRate;
  }

  generateSineWave(frequency: number, duration: number, volume: number = 0.5): Float32Array {
    const numSamples = Math.floor(duration * this.sampleRate);
    const samples = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / this.sampleRate;
      samples[i] = Math.sin(2 * Math.PI * frequency * t) * volume;
    }
    
    return samples;
  }

  generateTone(frequency: number, duration: number, volume: number = 0.5, instrument: string = 'sine'): Float32Array {
    switch (instrument) {
      case 'sawtooth':
        return this.generateSawtooth(frequency, duration, volume);
      case 'square':
        return this.generateSquare(frequency, duration, volume);
      case 'triangle':
        return this.generateTriangle(frequency, duration, volume);
      default:
        return this.generateSineWave(frequency, duration, volume);
    }
  }

  private generateSawtooth(frequency: number, duration: number, volume: number): Float32Array {
    const numSamples = Math.floor(duration * this.sampleRate);
    const samples = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / this.sampleRate;
      const phase = (frequency * t) % 1;
      samples[i] = (2 * phase - 1) * volume;
    }
    
    return samples;
  }

  private generateSquare(frequency: number, duration: number, volume: number): Float32Array {
    const numSamples = Math.floor(duration * this.sampleRate);
    const samples = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / this.sampleRate;
      const phase = (frequency * t) % 1;
      samples[i] = (phase < 0.5 ? 1 : -1) * volume;
    }
    
    return samples;
  }

  private generateTriangle(frequency: number, duration: number, volume: number): Float32Array {
    const numSamples = Math.floor(duration * this.sampleRate);
    const samples = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / this.sampleRate;
      const phase = (frequency * t) % 1;
      samples[i] = (Math.abs(2 * phase - 1) * 2 - 1) * volume;
    }
    
    return samples;
  }
}

export class AudioGenerator {
  private generator: SineWaveGenerator;
  private sampleRate: number;

  constructor(sampleRate: number = 44100) {
    this.generator = new SineWaveGenerator(sampleRate);
    this.sampleRate = sampleRate;
  }

  // Get genre-specific instrument for a planet
  private getGenreInstrument(planet: string, genre: string): string {
    const genreInstruments: Record<string, Record<string, string>> = {
      ambient: {
        Sun: 'sine', Moon: 'sine', Mercury: 'triangle', Venus: 'triangle',
        Mars: 'sine', Jupiter: 'sine', Saturn: 'sine', Uranus: 'triangle',
        Neptune: 'sine', Pluto: 'sine'
      },
      folk: {
        Sun: 'triangle', Moon: 'sine', Mercury: 'square', Venus: 'triangle',
        Mars: 'triangle', Jupiter: 'sine', Saturn: 'square', Uranus: 'triangle',
        Neptune: 'sine', Pluto: 'triangle'
      },
      jazz: {
        Sun: 'sawtooth', Moon: 'sine', Mercury: 'square', Venus: 'triangle',
        Mars: 'sawtooth', Jupiter: 'sine', Saturn: 'square', Uranus: 'triangle',
        Neptune: 'sine', Pluto: 'sawtooth'
      },
      classical: {
        Sun: 'sine', Moon: 'sine', Mercury: 'triangle', Venus: 'triangle',
        Mars: 'sine', Jupiter: 'sine', Saturn: 'sine', Uranus: 'triangle',
        Neptune: 'sine', Pluto: 'sine'
      },
      electronic: {
        Sun: 'sawtooth', Moon: 'sine', Mercury: 'square', Venus: 'triangle',
        Mars: 'sawtooth', Jupiter: 'sine', Saturn: 'square', Uranus: 'triangle',
        Neptune: 'sine', Pluto: 'sawtooth'
      },
      rock: {
        Sun: 'sawtooth', Moon: 'sine', Mercury: 'square', Venus: 'triangle',
        Mars: 'sawtooth', Jupiter: 'sine', Saturn: 'square', Uranus: 'triangle',
        Neptune: 'sine', Pluto: 'sawtooth'
      },
      blues: {
        Sun: 'sawtooth', Moon: 'sine', Mercury: 'triangle', Venus: 'triangle',
        Mars: 'sawtooth', Jupiter: 'sine', Saturn: 'square', Uranus: 'triangle',
        Neptune: 'sine', Pluto: 'sawtooth'
      },
      world: {
        Sun: 'triangle', Moon: 'sine', Mercury: 'triangle', Venus: 'triangle',
        Mars: 'triangle', Jupiter: 'sine', Saturn: 'square', Uranus: 'triangle',
        Neptune: 'sine', Pluto: 'triangle'
      },
      techno: {
        Sun: 'sawtooth', Moon: 'sine', Mercury: 'square', Venus: 'triangle',
        Mars: 'sawtooth', Jupiter: 'sine', Saturn: 'square', Uranus: 'triangle',
        Neptune: 'sine', Pluto: 'sawtooth'
      },
      chill: {
        Sun: 'sine', Moon: 'sine', Mercury: 'triangle', Venus: 'triangle',
        Mars: 'sine', Jupiter: 'sine', Saturn: 'sine', Uranus: 'triangle',
        Neptune: 'sine', Pluto: 'sine'
      }
    };

    // Return genre-specific instrument or fallback to default
    const genreMap = genreInstruments[genre] || genreInstruments['ambient'];
    return genreMap[planet] || 'sine';
  }

  // Generate audio composition from astrological chart
  generateChartAudio(chart: AstroChart, duration: number = 60, genre: string = 'ambient'): AudioComposition {
    const notes: AudioNote[] = [];
    const secondsPerHouse = duration / 12;
    
    // Base planetary mappings
    const basePlanetaryMappings = {
      Sun: { baseFrequency: 264, energy: 0.8, instrument: 'sine' },
      Moon: { baseFrequency: 294, energy: 0.4, instrument: 'triangle' },
      Mercury: { baseFrequency: 392, energy: 0.6, instrument: 'sine' },
      Venus: { baseFrequency: 349, energy: 0.5, instrument: 'triangle' },
      Mars: { baseFrequency: 330, energy: 0.9, instrument: 'sawtooth' },
      Jupiter: { baseFrequency: 440, energy: 0.7, instrument: 'sine' },
      Saturn: { baseFrequency: 220, energy: 0.3, instrument: 'square' },
      Uranus: { baseFrequency: 523, energy: 0.6, instrument: 'sawtooth' },
      Neptune: { baseFrequency: 494, energy: 0.4, instrument: 'triangle' },
      Pluto: { baseFrequency: 147, energy: 0.2, instrument: 'square' }
    };

    // Sort planets by house position
    const planetEntries = Object.entries(chart.planets);
    planetEntries.sort((a, b) => a[1].house - b[1].house);

    let currentTime = 0;
    
    planetEntries.forEach(([planetName, planetData]) => {
      const mapping = basePlanetaryMappings[planetName as keyof typeof basePlanetaryMappings];
      if (!mapping) return;

      const frequency = this.calculateFrequency(
        mapping.baseFrequency, 
        planetData.sign.degree, 
        planetData.house
      );
      
      const noteDuration = secondsPerHouse * 0.8; // Use 80% of house time
      const volume = this.calculateVolume(mapping.energy, planetData.house);

      notes.push({
        frequency,
        duration: noteDuration,
        volume,
        instrument: mapping.instrument,
        startTime: currentTime
      });

      currentTime += secondsPerHouse;
    });

    return {
      notes,
      duration,
      sampleRate: this.sampleRate,
      format: 'wav'
    };
  }

  // Generate WAV file buffer from composition
  generateWAVBuffer(composition: AudioComposition): Buffer {
    const { notes, duration, sampleRate } = composition;
    const totalSamples = Math.floor(duration * sampleRate);
    const audioData = new Float32Array(totalSamples);

    // Mix all notes
    notes.forEach(note => {
      const noteSamples = this.generator.generateTone(
        note.frequency, 
        note.duration, 
        note.volume, 
        note.instrument
      );
      
      const startSample = Math.floor(note.startTime * sampleRate);
      for (let i = 0; i < noteSamples.length && startSample + i < totalSamples; i++) {
        audioData[startSample + i] += noteSamples[i];
      }
    });

    // Normalize audio
    let maxAmplitude = 0;
    for (let i = 0; i < audioData.length; i++) {
      const absValue = Math.abs(audioData[i]);
      if (absValue > maxAmplitude) {
        maxAmplitude = absValue;
      }
    }
    
    if (maxAmplitude > 0) {
      for (let i = 0; i < audioData.length; i++) {
        audioData[i] /= maxAmplitude * 0.8; // Leave some headroom
      }
    }

    // Convert to 16-bit PCM
    const pcmData = new Int16Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      pcmData[i] = Math.round(audioData[i] * 32767);
    }

    // Create WAV header
    const header = this.createWAVHeader(pcmData.length * 2, sampleRate);
    
    // Combine header and audio data
    const buffer = Buffer.alloc(header.length + pcmData.length * 2);
    buffer.set(header, 0);
    buffer.set(new Uint8Array(pcmData.buffer), header.length);

    return buffer;
  }

  private createWAVHeader(dataLength: number, sampleRate: number): Buffer {
    const header = Buffer.alloc(44);
    
    // RIFF header
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataLength, 4);
    header.write('WAVE', 8);
    
    // fmt chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // fmt chunk size
    header.writeUInt16LE(1, 20); // PCM format
    header.writeUInt16LE(1, 22); // mono
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * 2, 28); // byte rate
    header.writeUInt16LE(2, 32); // block align
    header.writeUInt16LE(16, 34); // bits per sample
    
    // data chunk
    header.write('data', 36);
    header.writeUInt32LE(dataLength, 40);
    
    return header;
  }

  private calculateFrequency(baseFreq: number, signDegree: number, house: number): number {
    const degreeMultiplier = 1 + (signDegree / 30) * 0.5;
    const houseMultiplier = 1 + (house - 1) * 0.1;
    return baseFreq * degreeMultiplier * houseMultiplier;
  }

  private calculateVolume(planetEnergy: number, house: number): number {
    const baseVolume = 0.3;
    const energyGain = planetEnergy * 0.4;
    const houseGain = (house - 1) * 0.05;
    return Math.min(0.8, baseVolume + energyGain + houseGain);
  }
} 