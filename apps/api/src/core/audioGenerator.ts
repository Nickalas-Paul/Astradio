// Minimal audio generator for API backend
import { AstroChart, AspectData } from '../types/index.js';

export interface AudioNote {
  frequency: number;
  duration: number;
  volume: number;
  instrument: string;
  startTime: number;
  planet?: string;
  sign?: string;
  house?: number;
}

export interface AudioComposition {
  notes: AudioNote[];
  duration: number;
  totalDuration: number;
  sampleRate: number;
  format: 'wav' | 'mp3' | 'ogg';
}

export class AudioGenerator {
  private sampleRate: number;

  constructor(sampleRate: number = 44100) {
    this.sampleRate = sampleRate;
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
        startTime: currentTime,
        planet: planetName,
        sign: planetData.sign.name,
        house: planetData.house
      });

      currentTime += secondsPerHouse;
    });

    return {
      notes,
      duration,
      totalDuration: duration,
      sampleRate: this.sampleRate,
      format: 'wav'
    };
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