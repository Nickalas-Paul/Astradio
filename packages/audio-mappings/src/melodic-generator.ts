import { AstroChart, AudioConfiguration, AudioSession } from '@astradio/types';
import { 
  enhancedPlanetaryMappings, 
  calculateAspects, 
  calculateHarmonicInterval,
  getMusicalConfig,
  getRhythmPattern,
  getTonalQuality 
} from './enhanced-mappings';

// Planet role assignments for melodic composition
export const planetRoles = {
  Sun: "leadMelody",
  Moon: "counterMelody", 
  Mercury: "harmony",
  Venus: "harmony",
  Mars: "rhythm",
  Jupiter: "bassline",
  Saturn: "bassline",
  Uranus: "effects",
  Neptune: "ambientPad",
  Pluto: "modulation"
};

// Musical phrase structure
export interface MelodicPhrase {
  id: string;
  planet: string;
  role: string;
  notes: MelodicNote[];
  startTime: number;
  duration: number;
  intensity: number;
  variation: number;
}

export interface MelodicNote {
  frequency: number;
  duration: number;
  velocity: number;
  instrument: string;
  timestamp: number;
  effects?: string[];
}

export interface MelodicAudioSession extends AudioSession {
  mode: 'melodic';
  phrases: MelodicPhrase[];
  scale: string[];
  key: string;
  tempo: number;
  timeSignature: string;
}

// Scale definitions for different elements
const scaleDefinitions = {
  Fire: ['C', 'D', 'E', 'F#', 'G', 'A', 'B'], // Lydian
  Earth: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'], // Dorian
  Air: ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'], // Mixolydian
  Water: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'] // Aeolian
};

// Frequency mapping for notes
const noteFrequencies = {
  'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
  'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
  'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
};

export class MelodicGenerator {
  private currentSession: MelodicAudioSession | null = null;
  private aspects: any[] = [];
  private musicalConfig: any;

  async generateMelodicChart(
    chartData: AstroChart, 
    config?: AudioConfiguration
  ): Promise<MelodicAudioSession> {
    
    // Calculate aspects and get musical configuration
    this.aspects = calculateAspects(chartData);
    this.musicalConfig = getMusicalConfig(chartData, config?.genre || 'electronic');
    
    const sessionId = `melodic_${Date.now()}`;
    const tempo = config?.tempo || 120;
    const duration = config?.duration || 120;
    
    this.currentSession = {
      id: sessionId,
      chartId: chartData.metadata.birth_datetime,
      configuration: { 
        mode: 'melodic',
        tempo,
        duration,
        ...config 
      },
      isPlaying: true,
      startTime: Date.now(),
      mode: 'melodic',
      phrases: [],
      scale: this.musicalConfig.scale,
      key: this.musicalConfig.scale[0],
      tempo,
      timeSignature: '4/4'
    };

    console.log('🎵 Generating melodic chart composition...');
    console.log(`   Scale: ${this.musicalConfig.scale.join(', ')}`);
    console.log(`   Tempo: ${tempo} BPM`);
    console.log(`   Aspects: ${this.aspects.length} planetary relationships`);

    // Generate phrases for each planet
    const phrases = this.generatePlanetaryPhrases(chartData, config);
    this.currentSession.phrases = phrases;

    // Apply harmonic relationships from aspects
    this.applyHarmonicRelationships(phrases);

    // Generate rhythmic patterns based on modalities
    this.applyRhythmicPatterns(phrases, chartData);

    console.log(`✅ Generated ${phrases.length} melodic phrases`);
    console.log(`   Total notes: ${phrases.reduce((sum, p) => sum + p.notes.length, 0)}`);

    return this.currentSession;
  }

  private generatePlanetaryPhrases(
    chartData: AstroChart, 
    config?: AudioConfiguration
  ): MelodicPhrase[] {
    const phrases: MelodicPhrase[] = [];
    const planets = Object.entries(chartData.planets);
    
    // Sort planets by house position for sequential generation
    planets.sort((a, b) => a[1].house - b[1].house);
    
    let currentTime = 0;
    const phraseDuration = 8; // 8 beats per phrase
    
    planets.forEach(([planetName, planetData], index) => {
      const role = planetRoles[planetName as keyof typeof planetRoles];
      const mapping = enhancedPlanetaryMappings[planetName as keyof typeof enhancedPlanetaryMappings];
      
      if (!role || !mapping) return;

      // Calculate phrase characteristics based on planet properties
      const intensity = mapping.energy;
      const variation = this.calculateVariation(planetData, mapping);
      const phraseLength = this.calculatePhraseLength(planetData.house, mapping.modality);
      
      // Generate notes for this phrase
      const notes = this.generatePhraseNotes(
        planetName,
        planetData,
        mapping,
        currentTime,
        phraseLength,
        config
      );

      const phrase: MelodicPhrase = {
        id: `${planetName}_phrase_${index}`,
        planet: planetName,
        role,
        notes,
        startTime: currentTime,
        duration: phraseLength,
        intensity,
        variation
      };

      phrases.push(phrase);
      currentTime += phraseLength + 0.5; // Add gap between phrases
    });

    return phrases;
  }

  private generatePhraseNotes(
    planetName: string,
    planetData: any,
    mapping: any,
    startTime: number,
    phraseLength: number,
    config?: AudioConfiguration
  ): MelodicNote[] {
    const notes: MelodicNote[] = [];
    const scale = this.musicalConfig.scale;
    const role = planetRoles[planetName as keyof typeof planetRoles];
    
    // Determine number of notes based on role and planet energy
    const noteCount = this.calculateNoteCount(role, mapping.energy, phraseLength);
    
    // Generate note sequence
    for (let i = 0; i < noteCount; i++) {
      const noteIndex = this.weightedNoteSelection(scale, i, noteCount, planetData);
      const noteName = scale[noteIndex];
      const octave = this.calculateOctave(planetName, role, mapping);
      const frequency = noteFrequencies[noteName as keyof typeof noteFrequencies] * Math.pow(2, octave - 4);
      
      // Calculate note duration based on role and modality
      const noteDuration = this.calculateNoteDuration(role, mapping.modality, phraseLength / noteCount);
      
      // Calculate velocity based on planet energy and dignity
      const velocity = this.calculateVelocity(mapping.energy, planetData.house);
      
      // Determine instrument based on role and genre
      const instrument = this.getInstrumentForRole(role, config?.genre || 'electronic');
      
      // Add effects based on planet characteristics
      const effects = this.calculateEffects(planetName, planetData, mapping);
      
      const note: MelodicNote = {
        frequency,
        duration: noteDuration,
        velocity,
        instrument,
        timestamp: startTime + (i * phraseLength / noteCount),
        effects
      };
      
      notes.push(note);
    }
    
    return notes;
  }

  private weightedNoteSelection(
    scale: string[], 
    noteIndex: number, 
    totalNotes: number, 
    planetData: any
  ): number {
    // Create weighted selection favoring certain notes based on planet position
    const weights = scale.map((_, index) => {
      // Favor notes that correspond to planet's sign degree
      const degreeWeight = 1 - Math.abs(index - (planetData.sign.degree / 30) * scale.length) / scale.length;
      // Favor notes that correspond to house position
      const houseWeight = 1 - Math.abs(index - (planetData.house / 12) * scale.length) / scale.length;
      return (degreeWeight + houseWeight) / 2;
    });
    
    // Normalize weights
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = weights.map(w => w / totalWeight);
    
    // Weighted random selection
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < normalizedWeights.length; i++) {
      cumulativeWeight += normalizedWeights[i];
      if (random <= cumulativeWeight) {
        return i;
      }
    }
    
    return Math.floor(Math.random() * scale.length);
  }

  private calculateOctave(planetName: string, role: string, mapping: any): number {
    const baseOctave = mapping.genreVariations?.electronic?.octave || 4;
    
    // Adjust octave based on role
    switch (role) {
      case 'leadMelody': return baseOctave + 1;
      case 'counterMelody': return baseOctave;
      case 'harmony': return baseOctave;
      case 'bassline': return baseOctave - 2;
      case 'rhythm': return baseOctave - 1;
      case 'ambientPad': return baseOctave - 1;
      case 'effects': return baseOctave + 2;
      case 'modulation': return baseOctave;
      default: return baseOctave;
    }
  }

  private calculateNoteDuration(role: string, modality: string, baseDuration: number): number {
    const rhythmPattern = getRhythmPattern(modality);
    
    // Adjust duration based on role and rhythm pattern
    switch (role) {
      case 'leadMelody': return baseDuration * 1.2;
      case 'counterMelody': return baseDuration * 0.8;
      case 'harmony': return baseDuration * 1.5;
      case 'bassline': return baseDuration * 2.0;
      case 'rhythm': return baseDuration * 0.5;
      case 'ambientPad': return baseDuration * 3.0;
      case 'effects': return baseDuration * 0.3;
      case 'modulation': return baseDuration * 1.0;
      default: return baseDuration;
    }
  }

  private calculateVelocity(energy: number, house: number): number {
    // Velocity ranges from 0.3 to 1.0
    const energyVelocity = 0.3 + (energy * 0.7);
    const houseVelocity = 0.8 + (house / 12) * 0.2;
    return Math.min(1.0, (energyVelocity + houseVelocity) / 2);
  }

  private getInstrumentForRole(role: string, genre: string): string {
    const instruments = this.musicalConfig.instruments;
    
    switch (role) {
      case 'leadMelody': return instruments.melody[0];
      case 'counterMelody': return instruments.melody[1] || instruments.melody[0];
      case 'harmony': return instruments.harmony[0];
      case 'bassline': return instruments.bass[0];
      case 'rhythm': return instruments.rhythm[0];
      case 'ambientPad': return instruments.harmony[0];
      case 'effects': return instruments.effects[0];
      case 'modulation': return instruments.effects[1] || instruments.effects[0];
      default: return instruments.melody[0];
    }
  }

  private calculateEffects(planetName: string, planetData: any, mapping: any): string[] {
    const effects: string[] = [];
    
    // Add effects based on planet characteristics
    if (planetName === 'Uranus') effects.push('distortion');
    if (planetName === 'Neptune') effects.push('reverb');
    if (planetName === 'Pluto') effects.push('filter');
    if (mapping.element === 'Fire') effects.push('drive');
    if (mapping.element === 'Water') effects.push('delay');
    
    // Add effects based on house position
    if (planetData.house <= 3) effects.push('lowpass');
    if (planetData.house >= 10) effects.push('highpass');
    
    return effects;
  }

  private calculateVariation(planetData: any, mapping: any): number {
    // Variation based on planet's modality and energy
    const modalityVariation = {
      'Cardinal': 0.8,
      'Fixed': 0.3,
      'Mutable': 0.9
    };
    
    return (mapping.energy + modalityVariation[mapping.modality as keyof typeof modalityVariation]) / 2;
  }

  private calculatePhraseLength(house: number, modality: string): number {
    const baseLength = 8; // 8 beats
    const houseMultiplier = 1 + (house - 1) * 0.1;
    const modalityMultiplier = {
      'Cardinal': 1.2,
      'Fixed': 1.5,
      'Mutable': 0.8
    };
    
    return baseLength * houseMultiplier * modalityMultiplier[modality as keyof typeof modalityMultiplier];
  }

  private calculateNoteCount(role: string, energy: number, phraseLength: number): number {
    const baseCount = Math.floor(phraseLength * 2); // 2 notes per beat average
    
    // Adjust based on role
    const roleMultiplier = {
      'leadMelody': 1.5,
      'counterMelody': 1.2,
      'harmony': 0.8,
      'bassline': 0.5,
      'rhythm': 2.0,
      'ambientPad': 0.3,
      'effects': 3.0,
      'modulation': 1.0
    };
    
    return Math.max(1, Math.floor(baseCount * roleMultiplier[role as keyof typeof roleMultiplier] * energy));
  }

  private applyHarmonicRelationships(phrases: MelodicPhrase[]): void {
    // Apply harmonic intervals based on aspects
    this.aspects.forEach(aspect => {
      const phrase1 = phrases.find(p => p.planet === aspect.planet1);
      const phrase2 = phrases.find(p => p.planet === aspect.planet2);
      
      if (phrase1 && phrase2) {
        // Apply harmonic interval to corresponding notes
        phrase1.notes.forEach((note, index) => {
          if (phrase2.notes[index]) {
            const harmonicFreq = calculateHarmonicInterval(note.frequency, aspect.type);
            phrase2.notes[index].frequency = harmonicFreq;
          }
        });
      }
    });
  }

  private applyRhythmicPatterns(phrases: MelodicPhrase[], chartData: AstroChart): void {
    // Apply rhythmic patterns based on modalities
    phrases.forEach(phrase => {
      const planetData = chartData.planets[phrase.planet];
      const mapping = enhancedPlanetaryMappings[phrase.planet as keyof typeof enhancedPlanetaryMappings];
      
      if (planetData && mapping) {
        const rhythmPattern = getRhythmPattern(mapping.modality);
        
        // Adjust note durations based on rhythm pattern
        phrase.notes.forEach(note => {
          switch (rhythmPattern.rhythm) {
            case 'quarter_notes':
              note.duration = note.duration * 1.0;
              break;
            case 'whole_notes':
              note.duration = note.duration * 2.0;
              break;
            case 'eighth_notes':
              note.duration = note.duration * 0.5;
              break;
          }
        });
      }
    });
  }

  getCurrentSession(): MelodicAudioSession | null {
    return this.currentSession;
  }

  stopAll(): void {
    if (this.currentSession) {
      this.currentSession.isPlaying = false;
      this.currentSession = null;
    }
  }
}

export const melodicGenerator = new MelodicGenerator(); 