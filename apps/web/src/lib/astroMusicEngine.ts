// Astrological Music Generation Engine
// Converts Swiss Ephemeris chart data into musical parameters and generates real-time audio

import * as Tone from 'tone';

export interface AstroMusicConfig {
  genre: string;
  duration: number;
  volume: number;
  tempo: number;
}

export interface MusicalNote {
  frequency: number;
  duration: number;
  volume: number;
  instrument: string;
  startTime: number;
  planet?: string;
  sign?: string;
  house?: number;
  aspect?: string;
}

export interface PlanetMusicalMapping {
  baseFrequency: number;
  energy: number;
  instrument: string;
  element: string;
  qualities: string[];
  color: string;
}

export interface SignMusicalMapping {
  frequency: number;
  rhythm: string;
  element: string;
  scale: string[];
  harmony: string;
}

export interface HouseMusicalMapping {
  tempo: number;
  volume: number;
  harmony: string;
  description: string;
}

export interface AspectMusicalMapping {
  frequency: number;
  energy: number;
  meaning: string;
  musicalQuality: string;
  orb: number;
}

class AstroMusicEngine {
  private synths: Map<string, Tone.Synth> = new Map();
  private isInitialized = false;
  private currentSession: any = null;
  private scheduledEvents: any[] = [];

  // Planetary musical mappings based on astrological principles
  private planetaryMappings: Record<string, PlanetMusicalMapping> = {
    Sun: {
      baseFrequency: 264, // C4 - Solar energy
      energy: 0.9,
      instrument: 'sine',
      element: 'fire',
      qualities: ['leadership', 'vitality', 'creativity'],
      color: '#FFD700'
    },
    Moon: {
      baseFrequency: 294, // D4 - Lunar intuition
      energy: 0.7,
      instrument: 'triangle',
      element: 'water',
      qualities: ['emotion', 'intuition', 'nurturing'],
      color: '#C0C0C0'
    },
    Mercury: {
      baseFrequency: 392, // G4 - Mercurial communication
      energy: 0.6,
      instrument: 'square',
      element: 'air',
      qualities: ['communication', 'intellect', 'adaptability'],
      color: '#87CEEB'
    },
    Venus: {
      baseFrequency: 349, // F4 - Venusian harmony
      energy: 0.8,
      instrument: 'triangle',
      element: 'earth',
      qualities: ['beauty', 'harmony', 'relationships'],
      color: '#FFB6C1'
    },
    Mars: {
      baseFrequency: 330, // E4 - Martial energy
      energy: 0.9,
      instrument: 'sawtooth',
      element: 'fire',
      qualities: ['action', 'passion', 'courage'],
      color: '#FF6B6B'
    },
    Jupiter: {
      baseFrequency: 440, // A4 - Jovian expansion
      energy: 0.8,
      instrument: 'sine',
      element: 'fire',
      qualities: ['wisdom', 'expansion', 'optimism'],
      color: '#FFD93D'
    },
    Saturn: {
      baseFrequency: 220, // A3 - Saturnine structure
      energy: 0.5,
      instrument: 'square',
      element: 'earth',
      qualities: ['discipline', 'structure', 'limitation'],
      color: '#8B4513'
    },
    Uranus: {
      baseFrequency: 523, // C5 - Uranian innovation
      energy: 0.7,
      instrument: 'sawtooth',
      element: 'air',
      qualities: ['innovation', 'rebellion', 'freedom'],
      color: '#00CED1'
    },
    Neptune: {
      baseFrequency: 494, // B4 - Neptunian transcendence
      energy: 0.6,
      instrument: 'triangle',
      element: 'water',
      qualities: ['spirituality', 'illusion', 'compassion'],
      color: '#4169E1'
    },
    Pluto: {
      baseFrequency: 147, // D3 - Plutonian transformation
      energy: 0.4,
      instrument: 'square',
      element: 'water',
      qualities: ['transformation', 'power', 'regeneration'],
      color: '#8A2BE2'
    }
  };

  // Zodiac sign musical characteristics
  private signMappings: Record<string, SignMusicalMapping> = {
    Aries: {
      frequency: 1.0,
      rhythm: 'energetic',
      element: 'fire',
      scale: ['C', 'D', 'E', 'F#', 'G', 'A', 'B'],
      harmony: 'major'
    },
    Taurus: {
      frequency: 0.9,
      rhythm: 'steady',
      element: 'earth',
      scale: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'],
      harmony: 'minor'
    },
    Gemini: {
      frequency: 1.1,
      rhythm: 'varied',
      element: 'air',
      scale: ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'],
      harmony: 'major'
    },
    Cancer: {
      frequency: 0.8,
      rhythm: 'flowing',
      element: 'water',
      scale: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'],
      harmony: 'minor'
    },
    Leo: {
      frequency: 1.2,
      rhythm: 'bold',
      element: 'fire',
      scale: ['C', 'D', 'E', 'F#', 'G', 'A', 'B'],
      harmony: 'major'
    },
    Virgo: {
      frequency: 0.7,
      rhythm: 'precise',
      element: 'earth',
      scale: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'],
      harmony: 'minor'
    },
    Libra: {
      frequency: 1.0,
      rhythm: 'balanced',
      element: 'air',
      scale: ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'],
      harmony: 'major'
    },
    Scorpio: {
      frequency: 0.6,
      rhythm: 'intense',
      element: 'water',
      scale: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'],
      harmony: 'minor'
    },
    Sagittarius: {
      frequency: 1.3,
      rhythm: 'expansive',
      element: 'fire',
      scale: ['C', 'D', 'E', 'F#', 'G', 'A', 'B'],
      harmony: 'major'
    },
    Capricorn: {
      frequency: 0.8,
      rhythm: 'structured',
      element: 'earth',
      scale: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'],
      harmony: 'minor'
    },
    Aquarius: {
      frequency: 1.1,
      rhythm: 'innovative',
      element: 'air',
      scale: ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'],
      harmony: 'major'
    },
    Pisces: {
      frequency: 0.5,
      rhythm: 'dreamy',
      element: 'water',
      scale: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'],
      harmony: 'minor'
    }
  };

  // House musical characteristics
  private houseMappings: Record<number, HouseMusicalMapping> = {
    1: { tempo: 1.2, volume: 1.0, harmony: 'major', description: 'Identity & Self' },
    2: { tempo: 0.8, volume: 0.7, harmony: 'minor', description: 'Values & Resources' },
    3: { tempo: 1.1, volume: 0.8, harmony: 'major', description: 'Communication & Learning' },
    4: { tempo: 0.9, volume: 0.9, harmony: 'minor', description: 'Home & Family' },
    5: { tempo: 1.3, volume: 1.0, harmony: 'major', description: 'Creativity & Romance' },
    6: { tempo: 0.7, volume: 0.6, harmony: 'minor', description: 'Work & Health' },
    7: { tempo: 1.0, volume: 0.8, harmony: 'major', description: 'Partnerships & Balance' },
    8: { tempo: 0.6, volume: 0.5, harmony: 'minor', description: 'Transformation & Shared Resources' },
    9: { tempo: 1.2, volume: 0.9, harmony: 'major', description: 'Philosophy & Travel' },
    10: { tempo: 1.1, volume: 1.0, harmony: 'major', description: 'Career & Public Image' },
    11: { tempo: 1.0, volume: 0.8, harmony: 'major', description: 'Friendships & Groups' },
    12: { tempo: 0.5, volume: 0.4, harmony: 'minor', description: 'Spirituality & Hidden Things' }
  };

  // Aspect musical characteristics
  private aspectMappings: Record<string, AspectMusicalMapping> = {
    conjunction: {
      frequency: 1.0,
      energy: 0.8,
      meaning: 'Unity & Focus',
      musicalQuality: 'unison',
      orb: 8
    },
    opposition: {
      frequency: 2.0,
      energy: 0.9,
      meaning: 'Balance & Tension',
      musicalQuality: 'octave',
      orb: 8
    },
    trine: {
      frequency: 1.5,
      energy: 0.7,
      meaning: 'Harmony & Flow',
      musicalQuality: 'perfect_fifth',
      orb: 8
    },
    square: {
      frequency: 1.33,
      energy: 0.6,
      meaning: 'Challenge & Growth',
      musicalQuality: 'perfect_fourth',
      orb: 8
    },
    sextile: {
      frequency: 1.17,
      energy: 0.5,
      meaning: 'Opportunity & Cooperation',
      musicalQuality: 'major_third',
      orb: 6
    }
  };

  // Genre-specific instrument mappings
  private genreInstruments: Record<string, Record<string, string>> = {
    ambient: {
      Sun: 'sine', Moon: 'sine', Mercury: 'triangle', Venus: 'triangle',
      Mars: 'sine', Jupiter: 'sine', Saturn: 'sine', Uranus: 'triangle',
      Neptune: 'sine', Pluto: 'sine'
    },
    techno: {
      Sun: 'sawtooth', Moon: 'sine', Mercury: 'square', Venus: 'triangle',
      Mars: 'sawtooth', Jupiter: 'sine', Saturn: 'square', Uranus: 'triangle',
      Neptune: 'sine', Pluto: 'sawtooth'
    },
    world: {
      Sun: 'triangle', Moon: 'sine', Mercury: 'triangle', Venus: 'triangle',
      Mars: 'triangle', Jupiter: 'sine', Saturn: 'square', Uranus: 'triangle',
      Neptune: 'sine', Pluto: 'triangle'
    },
    'hip-hop': {
      Sun: 'sawtooth', Moon: 'sine', Mercury: 'square', Venus: 'triangle',
      Mars: 'sawtooth', Jupiter: 'sine', Saturn: 'square', Uranus: 'triangle',
      Neptune: 'sine', Pluto: 'sawtooth'
    }
  };

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🎵 Initializing AstroMusicEngine...');
      
      // Start Tone.js audio context
      await Tone.start();
      console.log('✅ Audio context started:', Tone.context.state);
      
      // Initialize synths for each planet
      this.initializeSynths();
      
      this.isInitialized = true;
      console.log('✅ AstroMusicEngine initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AstroMusicEngine:', error);
      throw error;
    }
  }

  private initializeSynths(): void {
    console.log('🎵 Initializing planetary synths...');
    
    Object.keys(this.planetaryMappings).forEach(planet => {
      const mapping = this.planetaryMappings[planet];
      
      // Create synth with planet-specific settings
      const synth = new Tone.Synth({
        oscillator: {
          type: mapping.instrument as any
        },
        envelope: {
          attack: 0.1,
          decay: 0.2,
          sustain: 0.3,
          release: 0.8
        }
      }).toDestination();

      this.synths.set(planet, synth);
      console.log(`✅ Initialized synth for ${planet} (${mapping.instrument})`);
    });
  }

  // Convert astrological chart data to musical notes
  generateChartMusic(chartData: any, config: AstroMusicConfig): MusicalNote[] {
    console.log('🎵 Generating music from chart data:', {
      planets: Object.keys(chartData.planets || {}).length,
      genre: config.genre,
      duration: config.duration
    });

    const notes: MusicalNote[] = [];
    const planets = chartData.planets || {};
    const aspects = chartData.aspects || [];
    
    // Calculate timing
    const secondsPerPlanet = config.duration / Math.max(Object.keys(planets).length, 1);
    let currentTime = 0;

    // Generate notes for each planet
    Object.entries(planets).forEach(([planetName, planetData]: [string, any]) => {
      const mapping = this.planetaryMappings[planetName];
      if (!mapping) {
        console.warn(`⚠️ No mapping found for planet: ${planetName}`);
        return;
      }

      const note = this.generatePlanetaryNote(planetName, planetData, mapping, config, currentTime);
      if (note) {
        notes.push(note);
        console.log(`🎵 Generated note for ${planetName}:`, {
          frequency: Math.round(note.frequency),
          duration: note.duration.toFixed(2),
          volume: note.volume.toFixed(2),
          instrument: note.instrument,
          sign: note.sign,
          house: note.house
        });
      }

      currentTime += secondsPerPlanet;
    });

    // Generate aspect-based harmonic notes
    aspects.forEach((aspect: any, index: number) => {
      const aspectNote = this.generateAspectNote(aspect, config, currentTime + (index * 2));
      if (aspectNote) {
        notes.push(aspectNote);
        console.log(`🎵 Generated aspect note:`, {
          aspect: `${aspect.planet1}-${aspect.planet2} ${aspect.type}`,
          frequency: Math.round(aspectNote.frequency),
          volume: aspectNote.volume.toFixed(2)
        });
      }
    });

    console.log(`🎵 Total notes generated: ${notes.length}`);
    return notes;
  }

  private generatePlanetaryNote(
    planetName: string,
    planetData: any,
    mapping: PlanetMusicalMapping,
    config: AstroMusicConfig,
    startTime: number
  ): MusicalNote | null {
    try {
      // Get sign and house data
      const signName = planetData.sign?.name || 'Aries';
      const signMapping = this.signMappings[signName] || this.signMappings['Aries'];
      const houseMapping = this.houseMappings[planetData.house] || this.houseMappings[1];

      // Calculate frequency with astrological modifications
      let frequency = mapping.baseFrequency;
      
      // Modify by sign degree (0-29 degrees within sign)
      const signDegree = planetData.longitude % 30;
      frequency *= (1 + (signDegree / 30) * 0.5); // Up to 50% frequency variation
      
      // Modify by zodiac sign characteristics
      frequency *= signMapping.frequency;
      
      // Modify by house characteristics
      frequency *= houseMapping.tempo;

      // Calculate volume with astrological rules
      let volume = mapping.energy * config.volume;
      
      // House influence on volume
      volume *= houseMapping.volume;
      
      // Element compatibility bonus
      if (mapping.element === signMapping.element) {
        volume *= 1.2; // 20% boost for element compatibility
      }
      
      // Angular houses (1, 4, 7, 10) are stronger
      if ([1, 4, 7, 10].includes(planetData.house)) {
        volume *= 1.3; // 30% boost for angular houses
      }
      
      // Succedent houses (2, 5, 8, 11) are moderate
      if ([2, 5, 8, 11].includes(planetData.house)) {
        volume *= 1.1; // 10% boost for succedent houses
      }
      
      // Cadent houses (3, 6, 9, 12) are weaker
      if ([3, 6, 9, 12].includes(planetData.house)) {
        volume *= 0.9; // 10% reduction for cadent houses
      }

      // Clamp volume to reasonable range
      volume = Math.max(0.1, Math.min(1.0, volume));

      // Get genre-specific instrument
      const genreMap = this.genreInstruments[config.genre] || this.genreInstruments['ambient'];
      const instrument = genreMap[planetName] || mapping.instrument;

      const noteDuration = (config.duration / Math.max(Object.keys(this.planetaryMappings).length, 1)) * 0.8;

      return {
        frequency: Math.round(frequency),
        duration: noteDuration,
        volume: volume,
        instrument: instrument,
        startTime: startTime,
        planet: planetName,
        sign: signName,
        house: planetData.house
      };
    } catch (error) {
      console.error(`❌ Error generating note for ${planetName}:`, error);
      return null;
    }
  }

  private generateAspectNote(aspect: any, config: AstroMusicConfig, startTime: number): MusicalNote | null {
    try {
      const aspectMapping = this.aspectMappings[aspect.type];
      if (!aspectMapping) {
        console.warn(`⚠️ Unknown aspect type: ${aspect.type}`);
        return null;
      }

      // Calculate aspect strength based on angle
      const angleStrength = Math.max(0, 1 - (Math.abs(aspect.angle - 0) / 10));
      
      // Base frequency from the aspect type
      const baseFreq = 264; // Middle C
      let frequency = baseFreq * aspectMapping.frequency;
      
      // Adjust frequency based on the planets involved
      if (aspect.planet1 && aspect.planet2) {
        const planet1Mapping = this.planetaryMappings[aspect.planet1];
        const planet2Mapping = this.planetaryMappings[aspect.planet2];
        
        if (planet1Mapping && planet2Mapping) {
          const fromFreq = planet1Mapping.baseFrequency;
          const toFreq = planet2Mapping.baseFrequency;
          
          // Blend the frequencies based on aspect type
          switch (aspect.type) {
            case 'conjunction':
              frequency = (fromFreq + toFreq) / 2; // Average
              break;
            case 'opposition':
              frequency = Math.max(fromFreq, toFreq) * 1.5; // Higher frequency
              break;
            case 'trine':
              frequency = (fromFreq + toFreq) * 0.75; // Harmonious blend
              break;
            case 'square':
              frequency = Math.abs(fromFreq - toFreq) * 1.2; // Tension
              break;
            default:
              frequency = (fromFreq + toFreq) / 2; // Default blend
          }
        }
      }

      // Calculate volume based on aspect strength and type
      let volume = aspectMapping.energy * angleStrength * config.volume;
      
      // Aspect-specific volume adjustments
      switch (aspect.type) {
        case 'conjunction':
          volume *= 1.2; // Strongest aspect
          break;
        case 'opposition':
          volume *= 1.1; // Very strong
          break;
        case 'trine':
          volume *= 1.0; // Harmonious
          break;
        case 'square':
          volume *= 0.9; // Challenging
          break;
        case 'sextile':
          volume *= 0.8; // Gentle
          break;
        default:
          volume *= 0.7; // Minor aspects
      }

      // Clamp volume
      volume = Math.max(0.1, Math.min(1.0, volume));

      // Choose instrument based on aspect type
      let instrument = 'sine';
      switch (aspect.type) {
        case 'conjunction':
          instrument = 'sine'; // Pure, unified
          break;
        case 'opposition':
          instrument = 'square'; // Contrasting
          break;
        case 'trine':
          instrument = 'triangle'; // Harmonious
          break;
        case 'square':
          instrument = 'sawtooth'; // Tension
          break;
        case 'sextile':
          instrument = 'triangle'; // Gentle
          break;
        default:
          instrument = 'sine';
      }

      return {
        frequency: Math.round(frequency),
        duration: 3, // 3-second aspect note
        volume: volume,
        instrument: instrument,
        startTime: startTime,
        aspect: `${aspect.planet1}-${aspect.planet2} ${aspect.type}`
      };
    } catch (error) {
      console.error(`❌ Error generating aspect note:`, error);
      return null;
    }
  }

  // Play musical notes using Tone.js
  async playNotes(notes: MusicalNote[]): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`🎵 Playing ${notes.length} musical notes...`);

      // Stop any existing playback
      this.stop();

      // Schedule all notes
      notes.forEach(note => {
        const synth = this.synths.get(note.planet || 'Sun') || this.synths.get('Sun');
        if (synth) {
          const event = Tone.Transport.schedule(() => {
            synth.triggerAttackRelease(
              Tone.Frequency(note.frequency, "Hz"),
              note.duration,
              `+${note.startTime}`,
              note.volume
            );
          }, note.startTime);
          
          this.scheduledEvents.push(event);
        }
      });

      // Start playback
      Tone.Transport.start();
      console.log('✅ Music playback started');

      return true;
    } catch (error) {
      console.error('❌ Failed to play notes:', error);
      return false;
    }
  }

  // Stop current playback
  stop(): void {
    console.log('⏹️ Stopping music playback...');
    
    // Stop transport
    Tone.Transport.stop();
    Tone.Transport.cancel();
    
    // Clear scheduled events
    this.scheduledEvents.forEach(event => {
      if (event && typeof event.dispose === 'function') {
        event.dispose();
      }
    });
    this.scheduledEvents = [];
    
    // Stop all synths
    this.synths.forEach(synth => {
      synth.triggerRelease();
    });
    
    console.log('✅ Music playback stopped');
  }

  // Set volume for all synths
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.synths.forEach(synth => {
      synth.volume.value = Tone.gainToDb(clampedVolume);
    });
    console.log(`🔊 Volume set to: ${Math.round(clampedVolume * 100)}%`);
  }

  // Get current playback time
  getCurrentTime(): number {
    return Tone.Transport.seconds;
  }

  // Get total duration
  getDuration(): number {
    return Tone.Transport.seconds;
  }

  // Check if currently playing
  isPlaying(): boolean {
    return Tone.Transport.state === 'started';
  }

  // Cleanup
  destroy(): void {
    this.stop();
    this.synths.forEach(synth => {
      synth.dispose();
    });
    this.synths.clear();
    console.log('🎵 AstroMusicEngine destroyed');
  }
}

// Create singleton instance
let astroMusicEngineInstance: AstroMusicEngine | null = null;

const getAstroMusicEngine = (): AstroMusicEngine => {
  if (!astroMusicEngineInstance) {
    astroMusicEngineInstance = new AstroMusicEngine();
  }
  return astroMusicEngineInstance;
};

export default getAstroMusicEngine;
export type { AstroMusicConfig, MusicalNote, PlanetMusicalMapping, SignMusicalMapping, HouseMusicalMapping, AspectMusicalMapping };
