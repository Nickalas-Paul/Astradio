import { AstroChart, AudioSession, PlanetData, AudioConfiguration, MelodicAudioSession, GenreType, MoodType } from '@astradio/types';
import { melodicGenerator } from './melodic-generator';
import { generateMusicNarration, generateModeSpecificNarration, generateDualChartNarration } from './narration-generator';
import { exportEngine } from './export-engine';
import { advancedPlaybackEngine } from './advanced-playback';
import { 
  GENRE_CONFIGS, 
  MOOD_TO_GENRE_MAPPINGS, 
  getRandomGenre, 
  getGenreFromMood, 
  getAllGenres, 
  getAllMoods 
} from './genre-system';

// Export narration functions
export { generateMusicNarration, generateModeSpecificNarration, generateDualChartNarration };

// Export export engine
export { exportEngine };

// Export advanced playback engine
export { advancedPlaybackEngine };

// Export melodic generator
export { melodicGenerator };

// Export genre system
export { 
  GENRE_CONFIGS, 
  MOOD_TO_GENRE_MAPPINGS, 
  getRandomGenre, 
  getGenreFromMood, 
  getAllGenres, 
  getAllMoods 
};

// Export AudioGenerator
export { AudioGenerator } from './audioGenerator';

// Export enhanced interpreter
export { generateEnhancedInterpretation, CELESTIAL_INTERPRETATIONS } from './enhanced-interpreter';

// Export enhanced composition engine
export { enhancedCompositionEngine, EnhancedCompositionEngine } from './enhanced-composition';
export type { 
  HouseComposition, 
  HouseMelody, 
  HouseTransition, 
  CompositionConfig, 
  EnhancedComposition 
} from './enhanced-composition';

// Genre System
export * from './genre-system';
export * from './genre-narration';

// Node.js compatibility layer for Tone.js
let Tone: any = null;
try {
  Tone = require('tone');
} catch (error) {
  console.warn('Tone.js not available in Node.js environment. Audio features will be simulated.');
  // Create a mock Tone object for Node.js
  Tone = {
    start: async () => console.log('Mock Tone.js started'),
    Synth: class MockSynth {
      constructor() {}
      toDestination() { return this; }
      triggerAttackRelease() { console.log('Mock note played'); }
      volume = { value: 0 };
      disconnect() {}
    },
    Event: class MockEvent {
      constructor(callback: Function, time: number) {
        setTimeout(() => callback(time), time * 1000);
      }
      dispose() {}
    },
    Transport: {
      start: () => console.log('Mock transport started'),
      stop: () => console.log('Mock transport stopped')
    }
  };
}

// Extended planetary mappings with more musical properties
export const planetaryMappings = {
  // Traditional Planets
  Sun: { 
    instrument: 'sawtooth', 
    baseFrequency: 264, // C4
    energy: 0.8, 
    color: '#FFD700',
    element: 'Fire',
    effect: 'lead'
  },
  Moon: { 
    instrument: 'sine', 
    baseFrequency: 294, // D4
    energy: 0.4, 
    color: '#C0C0C0',
    element: 'Water',
    effect: 'ambient'
  },
  Mercury: { 
    instrument: 'square', 
    baseFrequency: 392, // G4
    energy: 0.6, 
    color: '#87CEEB',
    element: 'Air',
    effect: 'melodic'
  },
  Venus: { 
    instrument: 'triangle', 
    baseFrequency: 349, // F4
    energy: 0.5, 
    color: '#FFB6C1',
    element: 'Earth',
    effect: 'harmonic'
  },
  Mars: { 
    instrument: 'sawtooth', 
    baseFrequency: 440, // A4
    energy: 0.9, 
    color: '#FF6B6B',
    element: 'Fire',
    effect: 'rhythmic'
  },
  Jupiter: { 
    instrument: 'sine', 
    baseFrequency: 196, // G3
    energy: 0.7, 
    color: '#FFD93D',
    element: 'Air',
    effect: 'expansive'
  },
  Saturn: { 
    instrument: 'square', 
    baseFrequency: 147, // D3
    energy: 0.3, 
    color: '#A8A8A8',
    element: 'Earth',
    effect: 'structured'
  },
  
  // Outer Planets
  Uranus: { 
    instrument: 'sawtooth', 
    baseFrequency: 523, // C5
    energy: 0.8, 
    color: '#00CED1',
    element: 'Air',
    effect: 'glitch'
  },
  Neptune: { 
    instrument: 'sine', 
    baseFrequency: 262, // C4
    energy: 0.2, 
    color: '#4169E1',
    element: 'Water',
    effect: 'reverb'
  },
  Pluto: { 
    instrument: 'sawtooth', 
    baseFrequency: 73, // D2
    energy: 0.9, 
    color: '#8A2BE2',
    element: 'Water',
    effect: 'distortion'
  },
  
  // Asteroids and Points
  Chiron: { 
    instrument: 'triangle', 
    baseFrequency: 330, // E4
    energy: 0.6, 
    color: '#10B981',
    element: 'Fire',
    effect: 'tension'
  },
  Lilith: { 
    instrument: 'sine', 
    baseFrequency: 277, // C#4
    energy: 0.4, 
    color: '#1F2937',
    element: 'Water',
    effect: 'minor'
  },
  NorthNode: { 
    instrument: 'sawtooth', 
    baseFrequency: 415, // G#4
    energy: 0.7, 
    color: '#F59E0B',
    element: 'Air',
    effect: 'pull'
  },
  SouthNode: { 
    instrument: 'sine', 
    baseFrequency: 370, // F#4
    energy: 0.3, 
    color: '#6B7280',
    element: 'Earth',
    effect: 'release'
  },
  Ceres: { 
    instrument: 'triangle', 
    baseFrequency: 220, // A3
    energy: 0.5, 
    color: '#84CC16',
    element: 'Earth',
    effect: 'nurturing'
  },
  Juno: { 
    instrument: 'sine', 
    baseFrequency: 247, // B3
    energy: 0.6, 
    color: '#EC4899',
    element: 'Air',
    effect: 'partnership'
  },
  Vesta: { 
    instrument: 'square', 
    baseFrequency: 185, // F#3
    energy: 0.4, 
    color: '#F97316',
    element: 'Fire',
    effect: 'focused'
  },
  Pallas: { 
    instrument: 'triangle', 
    baseFrequency: 311, // D#4
    energy: 0.7, 
    color: '#8B5CF6',
    element: 'Air',
    effect: 'wisdom'
  },
  Eris: { 
    instrument: 'sawtooth', 
    baseFrequency: 98, // G2
    energy: 0.8, 
    color: '#DC2626',
    element: 'Fire',
    effect: 'disruption'
  }
};

// Element-based scales
const elementScales = {
  Fire: ['C', 'D', 'E', 'F#', 'G', 'A', 'B'], // Lydian
  Earth: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'], // Dorian
  Air: ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'], // Mixolydian
  Water: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'] // Aeolian
};

export class UniversalAudioEngine {
  private synths: Map<string, any> = new Map();
  private currentSession: AudioSession | null = null;
  private isInitialized = false;
  private scheduledEvents: any[] = [];
  private currentGenre: GenreType = getRandomGenre() as GenreType;
  private currentMood: MoodType | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // Ensure audio context is started (required for user interaction)
    try {
      await Tone.start();
      console.log('Audio context started:', Tone.context.state);
    } catch (error) {
      console.warn('Audio context start failed:', error);
    }
    
    this.initializeSynths();
    this.isInitialized = true;
  }

  private initializeSynths(): void {
    Object.keys(planetaryMappings).forEach(planet => {
      const mapping = planetaryMappings[planet as keyof typeof planetaryMappings];
      const synth = new Tone.Synth({
        oscillator: { type: mapping.instrument as any },
        envelope: {
          attack: 0.1,
          decay: 0.2,
          sustain: 0.3,
          release: 0.8
        }
      }).toDestination();
      this.synths.set(planet, synth);
    });
  }

  private calculateFrequency(baseFreq: number, signDegree: number, house: number): number {
    // Adjust frequency based on sign degree (0-29) and house (1-12)
    const degreeMultiplier = 1 + (signDegree / 30) * 0.5; // 0.5 octave range
    const houseMultiplier = 1 + (house - 1) * 0.1; // House affects pitch slightly
    return baseFreq * degreeMultiplier * houseMultiplier;
  }

  private calculateDuration(house: number, planetEnergy: number): number {
    // House affects duration: higher houses = longer notes
    const baseDuration = 0.5; // 0.5 seconds base
    const houseMultiplier = 1 + (house - 1) * 0.2; // Each house adds 20% duration
    const energyMultiplier = 0.5 + planetEnergy * 0.5; // Energy affects duration
    return baseDuration * houseMultiplier * energyMultiplier;
  }

  private calculateVolume(planetEnergy: number, house: number): number {
    // Energy and house position affect volume
    const baseVolume = -20; // dB
    const energyGain = planetEnergy * 10; // 0-10 dB based on energy
    const houseGain = (house - 1) * 2; // Higher houses slightly louder
    return baseVolume + energyGain + houseGain;
  }

  async generateSequential(chartData: AstroChart): Promise<AudioSession> {
    await this.initialize();
    
    // Clear any existing scheduled events
    this.scheduledEvents.forEach(event => event.dispose());
    this.scheduledEvents = [];
    
    const sessionId = `seq_${Date.now()}`;
    
    this.currentSession = {
      id: sessionId,
      chartId: chartData.metadata.birth_datetime,
      configuration: { mode: 'sequential', duration: 96 },
      isPlaying: true,
      startTime: Date.now()
    };

    console.log('Generating sequential chart audio...');

    // Schedule planets in order of their house positions
    const planetEntries = Object.entries(chartData.planets);
    planetEntries.sort((a, b) => a[1].house - b[1].house);

    let currentTime = 0;
    
    planetEntries.forEach(([planetName, planetData]) => {
      const mapping = planetaryMappings[planetName as keyof typeof planetaryMappings];
      if (!mapping) return;

      const synth = this.synths.get(planetName);
      if (!synth) return;

      const frequency = this.calculateFrequency(
        mapping.baseFrequency, 
        planetData.sign.degree, 
        planetData.house
      );
      
      const duration = this.calculateDuration(planetData.house, mapping.energy);
      const volume = this.calculateVolume(mapping.energy, planetData.house);

      // Schedule the note
      const event = new Tone.Event((time: number) => {
        synth.volume.value = volume;
        synth.triggerAttackRelease(frequency, duration, time);
        
        console.log(`Playing ${planetName} in ${planetData.sign.name} (House ${planetData.house})`);
        console.log(`   Frequency: ${frequency.toFixed(1)}Hz, Duration: ${duration.toFixed(2)}s, Volume: ${volume.toFixed(1)}dB`);
      }, currentTime);

      this.scheduledEvents.push(event);
      currentTime += duration + 0.2; // Add small gap between planets
    });

    // Start the sequence
    Tone.Transport.start();
    
    // Stop after all planets have played
    const totalDuration = currentTime + 1; // Add 1 second buffer
    setTimeout(() => {
      this.stopAll();
    }, totalDuration * 1000);

    return this.currentSession;
  }

  async generateLayered(chartData: AstroChart): Promise<AudioSession> {
    await this.initialize();
    
    // Clear any existing scheduled events
    this.scheduledEvents.forEach(event => event.dispose());
    this.scheduledEvents = [];
    
    const sessionId = `layered_${Date.now()}`;
    
    this.currentSession = {
      id: sessionId,
      chartId: chartData.metadata.birth_datetime,
      configuration: { mode: 'layered', duration: 60 },
      isPlaying: true,
      startTime: Date.now()
    };

    console.log('Generating layered chart audio...');

    // Play all planets simultaneously with different volumes and timing
    Object.entries(chartData.planets).forEach(([planetName, planetData]) => {
      const mapping = planetaryMappings[planetName as keyof typeof planetaryMappings];
      if (!mapping) return;

      const synth = this.synths.get(planetName);
      if (!synth) return;

      const frequency = this.calculateFrequency(
        mapping.baseFrequency, 
        planetData.sign.degree, 
        planetData.house
      );
      
      const duration = this.calculateDuration(planetData.house, mapping.energy);
      const volume = this.calculateVolume(mapping.energy, planetData.house) - 10; // Quieter for layered

      // Schedule with slight delays based on house position
      const delay = (planetData.house - 1) * 0.5;
      
      const event = new Tone.Event((time: number) => {
        synth.volume.value = volume;
        synth.triggerAttackRelease(frequency, duration, time);
        
        console.log(`Layered: ${planetName} in ${planetData.sign.name} (House ${planetData.house})`);
      }, delay);

      this.scheduledEvents.push(event);
    });

    // Start the sequence
    Tone.Transport.start();
    
    // Stop after 60 seconds
    setTimeout(() => {
      this.stopAll();
    }, 60000);

    return this.currentSession;
  }

  async generateOverlay(chart1: AstroChart, chart2: AstroChart, config?: AudioConfiguration): Promise<AudioSession> {
    await this.initialize();
    
    // Clear any existing scheduled events
    this.scheduledEvents.forEach(event => event.dispose());
    this.scheduledEvents = [];
    
    const sessionId = `overlay_${Date.now()}`;
    const duration = config?.duration || 120;
    const tempo = config?.tempo || 120;
    
    this.currentSession = {
      id: sessionId,
      chartId: `${chart1.metadata.birth_datetime}_${chart2.metadata.birth_datetime}`,
      configuration: { 
        mode: 'overlay', 
        duration,
        tempo,
        ...config
      },
      isPlaying: true,
      startTime: Date.now()
    };

    console.log('Generating overlay audio from two charts...');
    console.log(`   Configuration: ${JSON.stringify(this.currentSession.configuration)}`);
    console.log(`   Chart 1: ${chart1.metadata.birth_datetime} (${Object.keys(chart1.planets).length} planets)`);
    console.log(`   Chart 2: ${chart2.metadata.birth_datetime} (${Object.keys(chart2.planets).length} planets)`);

    // Calculate time per chart based on tempo
    const timePerChart = duration / 2;
    const tempoMultiplier = tempo / 120; // Adjust timing based on tempo

    // Chart 1 planets (first half)
    let currentTime = 0;
    Object.entries(chart1.planets).forEach(([planetName, planetData]) => {
      const mapping = planetaryMappings[planetName as keyof typeof planetaryMappings];
      if (!mapping) return;

      const synth = this.synths.get(planetName);
      if (!synth) return;

      const frequency = this.calculateFrequency(
        mapping.baseFrequency, 
        planetData.sign.degree, 
        planetData.house
      );
      
      // Adjust duration based on tempo
      let duration = this.calculateDuration(planetData.house, mapping.energy);
      duration = duration / tempoMultiplier;
      
      const volume = this.calculateVolume(mapping.energy, planetData.house);

      // Schedule the note
      const event = new Tone.Event((time: number) => {
        synth.volume.value = volume;
        synth.triggerAttackRelease(frequency, duration, time);
        
        console.log(`Playing Chart 1 ${planetName} in ${planetData.sign.name} (House ${planetData.house})`);
        console.log(`   Frequency: ${frequency.toFixed(1)}Hz, Duration: ${duration.toFixed(2)}s, Volume: ${volume.toFixed(1)}dB, Tempo: ${tempo}BPM`);
      }, currentTime);

      this.scheduledEvents.push(event);
      currentTime += duration + (0.2 / tempoMultiplier); // Adjust gap based on tempo
    });

    // Chart 2 planets (second half)
    currentTime = timePerChart;
    Object.entries(chart2.planets).forEach(([planetName, planetData]) => {
      const mapping = planetaryMappings[planetName as keyof typeof planetaryMappings];
      if (!mapping) return;

      const synth = this.synths.get(planetName);
      if (!synth) return;

      const frequency = this.calculateFrequency(
        mapping.baseFrequency, 
        planetData.sign.degree, 
        planetData.house
      );
      
      // Adjust duration based on tempo
      let duration = this.calculateDuration(planetData.house, mapping.energy);
      duration = duration / tempoMultiplier;
      
      const volume = this.calculateVolume(mapping.energy, planetData.house);

      // Schedule the note
      const event = new Tone.Event((time: number) => {
        synth.volume.value = volume;
        synth.triggerAttackRelease(frequency, duration, time);
        
        console.log(`Playing Chart 2 ${planetName} in ${planetData.sign.name} (House ${planetData.house})`);
        console.log(`   Frequency: ${frequency.toFixed(1)}Hz, Duration: ${duration.toFixed(2)}s, Volume: ${volume.toFixed(1)}dB, Tempo: ${tempo}BPM`);
      }, currentTime);

      this.scheduledEvents.push(event);
      currentTime += duration + (0.2 / tempoMultiplier); // Adjust gap based on tempo
    });

    // Start the sequence
    Tone.Transport.start();
    
    // Stop after specified duration
    setTimeout(() => {
      this.stopAll();
    }, duration * 1000);

    return this.currentSession;
  }

  // NEW: Preview audio generation (Phase 7)
  async generatePreview(chartData: AstroChart, duration: number = 60): Promise<AudioSession> {
    await this.initialize();
    
    // Clear any existing scheduled events
    this.scheduledEvents.forEach(event => event.dispose());
    this.scheduledEvents = [];
    
    const sessionId = `preview_${Date.now()}`;
    const secondsPerHouse = duration / 12;
    
    this.currentSession = {
      id: sessionId,
      chartId: chartData.metadata.birth_datetime,
      configuration: { mode: 'preview', duration },
      isPlaying: true,
      startTime: Date.now()
    };

    console.log(`Generating preview audio (${duration}s total, ${secondsPerHouse}s per house)...`);

    // Schedule planets in order of their house positions (1-12)
    const planetEntries = Object.entries(chartData.planets);
    planetEntries.sort((a, b) => a[1].house - b[1].house);

    let currentTime = 0;
    
    planetEntries.forEach(([planetName, planetData]) => {
      const mapping = planetaryMappings[planetName as keyof typeof planetaryMappings];
      if (!mapping) return;

      const synth = this.synths.get(planetName);
      if (!synth) return;

      const frequency = this.calculateFrequency(
        mapping.baseFrequency, 
        planetData.sign.degree, 
        planetData.house
      );
      
      const duration = secondsPerHouse * 0.8; // Use 80% of house time for planet sound
      const volume = this.calculateVolume(mapping.energy, planetData.house) - 5; // Slightly quieter for preview

      // Schedule planet sound
      const event = new Tone.Event((time: number) => {
        synth.volume.value = volume;
        synth.triggerAttackRelease(frequency, duration, time);
        console.log(`Preview: ${planetName} in ${planetData.sign.name} (House ${planetData.house})`);
      }, currentTime);

      this.scheduledEvents.push(event);
      currentTime += secondsPerHouse; // Move to next house
    });

    // Start the sequence
    Tone.Transport.start();
    
    // Stop after the specified duration
    setTimeout(() => {
      this.stopAll();
    }, duration * 1000);

    return this.currentSession;
  }

  // NEW: Melodic composition generation (Phase 5)
  async generateMelodic(chartData: AstroChart, config?: AudioConfiguration): Promise<MelodicAudioSession> {
    console.log('Generating melodic composition...');
    return await melodicGenerator.generateMelodicChart(chartData, config);
  }

  stopAll(): void {
    // Stop all scheduled events
    this.scheduledEvents.forEach(event => event.dispose());
    this.scheduledEvents = [];
    
    // Stop transport
    Tone.Transport.stop();
    
    // Disconnect synths
    this.synths.forEach(synth => synth.disconnect());
    
    // Stop melodic generator if active
    melodicGenerator.stopAll();
    
    if (this.currentSession) {
      this.currentSession.isPlaying = false;
      this.currentSession = null;
    }
  }

  getCurrentSession(): AudioSession | null {
    return this.currentSession || melodicGenerator.getCurrentSession() || null;
  }

  // Get audio configuration for a chart
  getAudioConfig(chartData: AstroChart): any {
    const planets = Object.keys(chartData.planets);
    const totalDuration = planets.length * 2; // Rough estimate
    
    return {
      mode: 'sequential',
      duration: totalDuration,
      planets,
      elements: [...new Set(planets.map(p => planetaryMappings[p as keyof typeof planetaryMappings]?.element))],
      totalHouses: Object.keys(chartData.houses).length
    };
  }
}

export const audioEngine = new UniversalAudioEngine(); 