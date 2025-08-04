import { AstroChart, AspectData } from '../types';

// Declare window for Node.js environment
declare const window: any;

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
  totalDuration: number;
  sampleRate: number;
}

export class AudioGenerator {
  private sampleRate = 44100;
  private audioContext: any = null;

  constructor() {
    // Initialize audio context for Node.js environment
    if (typeof window === 'undefined') {
      // Mock audio context for server-side
      this.audioContext = {
        sampleRate: this.sampleRate,
        createOscillator: () => ({
          frequency: { value: 440 },
          connect: () => {},
          start: () => {},
          stop: () => {}
        }),
        createGain: () => ({
          gain: { value: 0.5 },
          connect: () => {}
        })
      };
    }
  }

  generateTone(frequency: number, duration: number, volume: number = 0.5, instrument: string = 'sine'): Float32Array {
    const numSamples = Math.floor(duration * this.sampleRate);
    const audioBuffer = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
      const time = i / this.sampleRate;
      const amplitude = volume * Math.exp(-time / duration);
      
      switch (instrument) {
        case 'sine':
          audioBuffer[i] = amplitude * Math.sin(2 * Math.PI * frequency * time);
          break;
        case 'square':
          audioBuffer[i] = amplitude * (Math.sin(2 * Math.PI * frequency * time) > 0 ? 1 : -1);
          break;
        case 'sawtooth':
          audioBuffer[i] = amplitude * (2 * (frequency * time - Math.floor(frequency * time + 0.5)));
          break;
        case 'triangle':
          audioBuffer[i] = amplitude * (2 * Math.abs(2 * (frequency * time - Math.floor(frequency * time + 0.5))) - 1);
          break;
        default:
          audioBuffer[i] = amplitude * Math.sin(2 * Math.PI * frequency * time);
      }
    }
    
    return audioBuffer;
  }

  generateChartAudio(chartData: AstroChart, duration: number = 60, genre: string = 'ambient'): AudioComposition {
    const notes: AudioNote[] = [];
    const planets = Object.keys(chartData.planets);
    const timePerPlanet = duration / planets.length;
    
    let currentTime = 0;
    
    planets.forEach((planetName, index) => {
      const planetData = chartData.planets[planetName];
      const frequency = this.calculatePlanetFrequency(planetName, planetData);
      const noteDuration = timePerPlanet * 0.8; // Use 80% of time for note
      
      notes.push({
        frequency,
        duration: noteDuration,
        volume: 0.7,
        instrument: this.getPlanetInstrument(planetName),
        startTime: currentTime
      });
      
      currentTime += timePerPlanet;
    });
    
    return {
      notes,
      duration,
      totalDuration: duration,
      sampleRate: this.sampleRate
    };
  }

  generateDailyAudio(transitData: any, duration: number = 60, genre: string = 'ambient'): AudioComposition {
    const notes: AudioNote[] = [];
    const planets = transitData.planets || [];
    const timePerPlanet = duration / Math.max(planets.length, 1);
    
    let currentTime = 0;
    
    planets.forEach((planet: any, index: number) => {
      const frequency = this.calculateTransitFrequency(planet);
      const noteDuration = timePerPlanet * 0.8;
      
      notes.push({
        frequency,
        duration: noteDuration,
        volume: 0.6,
        instrument: 'sine',
        startTime: currentTime
      });
      
      currentTime += timePerPlanet;
    });
    
    return {
      notes,
      duration,
      totalDuration: duration,
      sampleRate: this.sampleRate
    };
  }

  generateSandboxAudio(chartData: AstroChart, aspects: any[] = [], configuration: any = {}, duration: number = 60, genre: string = 'ambient'): AudioComposition {
    const notes: AudioNote[] = [];
    const planets = Object.keys(chartData.planets);
    const timePerPlanet = duration / Math.max(planets.length, 1);
    
    let currentTime = 0;
    
    planets.forEach((planetName, index) => {
      const planetData = chartData.planets[planetName];
      const frequency = this.calculatePlanetFrequency(planetName, planetData);
      const noteDuration = timePerPlanet * 0.8;
      
      notes.push({
        frequency,
        duration: noteDuration,
        volume: 0.8,
        instrument: this.getPlanetInstrument(planetName),
        startTime: currentTime
      });
      
      currentTime += timePerPlanet;
    });
    
    return {
      notes,
      duration,
      totalDuration: duration,
      sampleRate: this.sampleRate
    };
  }

  generateWAVBuffer(composition: AudioComposition): ArrayBuffer {
    const { notes, totalDuration, sampleRate } = composition;
    const numSamples = Math.floor(totalDuration * sampleRate);
    const audioBuffer = new Float32Array(numSamples);
    
    // Mix all notes
    notes.forEach(note => {
      const startSample = Math.floor(note.startTime * sampleRate);
      const noteSamples = Math.floor(note.duration * sampleRate);
      const noteBuffer = this.generateTone(note.frequency, note.duration, note.volume, note.instrument);
      
      for (let i = 0; i < noteSamples && startSample + i < numSamples; i++) {
        audioBuffer[startSample + i] += noteBuffer[i] || 0;
      }
    });
    
    // Convert to WAV format
    return this.convertToWAV(audioBuffer, sampleRate);
  }

  private calculatePlanetFrequency(planetName: string, planetData: any): number {
    const baseFrequencies: Record<string, number> = {
      Sun: 264, // C4
      Moon: 294, // D4
      Mercury: 392, // G4
      Venus: 349, // F4
      Mars: 440, // A4
      Jupiter: 196, // G3
      Saturn: 147, // D3
      Uranus: 523, // C5
      Neptune: 262, // C4
      Pluto: 73 // D2
    };
    
    const baseFreq = baseFrequencies[planetName] || 440;
    const signDegree = planetData.sign.degree;
    const houseMultiplier = 1 + (planetData.house - 1) * 0.1;
    
    return baseFreq * (1 + signDegree / 30) * houseMultiplier;
  }

  private calculateTransitFrequency(planet: any): number {
    const baseFreq = 440; // A4
    const longitude = planet.longitude || 0;
    return baseFreq * (1 + longitude / 360);
  }

  private getPlanetInstrument(planetName: string): string {
    const instruments: Record<string, string> = {
      Sun: 'sawtooth',
      Moon: 'sine',
      Mercury: 'square',
      Venus: 'triangle',
      Mars: 'sawtooth',
      Jupiter: 'sine',
      Saturn: 'square',
      Uranus: 'sawtooth',
      Neptune: 'sine',
      Pluto: 'sawtooth'
    };
    
    return instruments[planetName] || 'sine';
  }

  private convertToWAV(audioBuffer: Float32Array, sampleRate: number): ArrayBuffer {
    const numSamples = audioBuffer.length;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const dataSize = numSamples * numChannels * bitsPerSample / 8;
    const fileSize = 36 + dataSize;
    
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, fileSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);
    
    // Audio data
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    return buffer;
  }
} 