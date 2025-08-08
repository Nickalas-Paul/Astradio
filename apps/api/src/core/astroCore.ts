import { AstroChart, PlanetData, AudioConfig, PlanetAudioMapping, SignData } from '../types/index.js';

export class AstroMusicEngine {
  private planetFrequencies: { [key: string]: number } = {
    'Sun': 261.63, // C4
    'Moon': 293.66, // D4
    'Mercury': 329.63, // E4
    'Venus': 349.23, // F4
    'Mars': 392.00, // G4
    'Jupiter': 440.00, // A4
    'Saturn': 493.88, // B4
    'Uranus': 523.25, // C5
    'Neptune': 587.33, // D5
    'Pluto': 659.25  // E5
  };

  private genreTemplates = {
    ambient: {
      tempo: 60,
      instruments: ['sine', 'triangle', 'sawtooth'],
      effects: ['reverb', 'delay', 'chorus'],
      keyPreference: 'minor'
    },
    techno: {
      tempo: 128,
      instruments: ['square', 'sawtooth', 'pulse'],
      effects: ['filter', 'distortion', 'delay'],
      keyPreference: 'minor'
    },
    world: {
      tempo: 90,
      instruments: ['sine', 'triangle', 'custom'],
      effects: ['reverb', 'chorus', 'pan'],
      keyPreference: 'modal'
    },
    'hip-hop': {
      tempo: 85,
      instruments: ['square', 'triangle', 'noise'],
      effects: ['filter', 'compression', 'reverb'],
      keyPreference: 'minor'
    }
  };

  private scales = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    pentatonic: [0, 2, 4, 7, 9],
    blues: [0, 3, 5, 6, 7, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10]
  };

  convertChartToAudio(chart: AstroChart, genre: 'ambient' | 'techno' | 'world' | 'hip-hop'): {
    audioConfig: AudioConfig;
    planetMappings: PlanetAudioMapping[];
  } {
    const template = this.genreTemplates[genre];
    
    // Determine key based on Sun sign
    const sunSign = chart.planets['Sun']?.sign;
    const key = this.determineKey(sunSign, genre);
    
    // Calculate tempo based on planetary aspects
    const tempo = this.calculateTempo(chart, template.tempo);
    
    // Generate scale
    const scale = this.generateScale(key, genre);
    
    const audioConfig: AudioConfig = {
      genre,
      tempo,
      key,
      scale,
      duration: 180 // 3 minutes
    };

    const planetMappings = this.generatePlanetMappings(chart, template, scale);

    return { audioConfig, planetMappings };
  }

  private determineKey(sunSign: SignData | undefined, genre: string): string {
    if (!sunSign) return 'C';

    const keyMapping: { [key: string]: string } = {
      'Aries': 'C', 'Taurus': 'D', 'Gemini': 'E', 'Cancer': 'F',
      'Leo': 'G', 'Virgo': 'A', 'Libra': 'B', 'Scorpio': 'C#',
      'Sagittarius': 'D#', 'Capricorn': 'F#', 'Aquarius': 'G#', 'Pisces': 'A#'
    };

    return keyMapping[sunSign.name] || 'C';
  }

  private calculateTempo(chart: AstroChart, baseTempo: number): number {
    // Modify tempo based on Mars and Mercury positions
    let tempoModifier = 0;
    
    const mars = chart.planets['Mars'];
    const mercury = chart.planets['Mercury'];
    
    if (mars?.sign.element === 'Fire') tempoModifier += 10;
    if (mars?.sign.element === 'Earth') tempoModifier -= 5;
    if (mercury?.retrograde) tempoModifier -= 8;
    
    return Math.max(60, Math.min(140, baseTempo + tempoModifier));
  }

  private generateScale(key: string, genre: string): string[] {
    const baseScale = genre === 'ambient' || genre === 'world' ? 
      this.scales.pentatonic : this.scales.minor;
    
    const keyOffset = this.getKeyOffset(key);
    
    return baseScale.map(note => this.numberToNote(note + keyOffset));
  }

  private getKeyOffset(key: string): number {
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return keys.indexOf(key);
  }

  private numberToNote(noteNumber: number): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return notes[noteNumber % 12];
  }

  private generatePlanetMappings(
    chart: AstroChart, 
    template: any, 
    scale: string[]
  ): PlanetAudioMapping[] {
    const mappings: PlanetAudioMapping[] = [];
    
    Object.entries(chart.planets).forEach(([planetName, planetData], index) => {
      const baseFreq = this.planetFrequencies[planetName] || 440;
      
      // Modify frequency based on sign and house
      const signModifier = this.getSignModifier(planetData.sign);
      const houseModifier = this.getHouseModifier(planetData.house);
      
      const frequency = baseFreq * signModifier * houseModifier;
      
      // Calculate volume based on house position
      const volume = this.calculatePlanetVolume(planetData);
      
      // Select instrument based on planet and genre
      const instrument = this.selectInstrument(planetName, template.instruments);
      
      // Generate envelope based on sign modality
      const envelope = this.generateEnvelope(planetData.sign);
      
      mappings.push({
        planet: planetName,
        instrument,
        frequency,
        volume,
        envelope
      });
    });
    
    return mappings;
  }

  private getSignModifier(sign: SignData): number {
    const elementModifiers = {
      'Fire': 1.1,
      'Earth': 0.9,
      'Air': 1.05,
      'Water': 0.95
    };
    
    return elementModifiers[sign.element];
  }

  private getHouseModifier(house: number): number {
    // Houses 1, 5, 9 (fire houses) - higher pitch
    // Houses 2, 6, 10 (earth houses) - lower pitch
    // Houses 3, 7, 11 (air houses) - mid-high pitch
    // Houses 4, 8, 12 (water houses) - mid-low pitch
    
    const houseModifiers = [1.2, 0.8, 1.1, 0.9, 1.3, 0.85, 1.15, 0.92, 1.25, 0.88, 1.18, 0.95];
    return houseModifiers[house - 1] || 1.0;
  }

  private calculatePlanetVolume(planetData: PlanetData): number {
    // Volume based on house (angular houses louder)
    const angularHouses = [1, 4, 7, 10];
    const baseVolume = angularHouses.includes(planetData.house) ? 0.8 : 0.6;
    
    // Reduce volume for retrograde planets
    return planetData.retrograde ? baseVolume * 0.7 : baseVolume;
  }

  private selectInstrument(planet: string, availableInstruments: string[]): string {
    const planetInstruments: { [key: string]: string } = {
      'Sun': 'sine',
      'Moon': 'triangle',
      'Mercury': 'square',
      'Venus': 'sine',
      'Mars': 'sawtooth',
      'Jupiter': 'triangle',
      'Saturn': 'square',
      'Uranus': 'pulse',
      'Neptune': 'sine',
      'Pluto': 'sawtooth'
    };
    
    const preferred = planetInstruments[planet];
    return availableInstruments.includes(preferred) ? preferred : availableInstruments[0];
  }

  private generateEnvelope(sign: SignData): { attack: number; decay: number; sustain: number; release: number } {
    const modalityEnvelopes = {
      'Cardinal': { attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.5 },
      'Fixed': { attack: 0.3, decay: 0.3, sustain: 0.8, release: 0.8 },
      'Mutable': { attack: 0.2, decay: 0.4, sustain: 0.5, release: 0.3 }
    };
    
    return modalityEnvelopes[sign.modality];
  }
}

export default AstroMusicEngine;