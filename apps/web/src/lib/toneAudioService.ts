// Tone.js Audio Service for Astradio
// Replaces WAV generation with real-time, responsive audio playback

// Remove static import - will be loaded dynamically
let Tone: any = null;

export interface NoteEvent {
  pitch: number;
  duration: number;
  startTime: number;
  volume?: number;
  instrument?: string;
  velocity?: number;
}

export interface ChartAudioConfig {
  planets: {
    [key: string]: {
      frequency: number;
      energy: number;
      instrument: string;
      color: string;
    };
  };
  aspects: Array<{
    type: string;
    planets: string[];
    harmony: number;
    tension: number;
  }>;
  houses: Array<{
    number: number;
    tempo: number;
    mood: string;
  }>;
  genre: string;
  mood: string;
}

class ToneAudioService {
  private synths: Map<string, any> = new Map();
  private isInitialized = false;
  private isPlaying = false;
  private currentSequence: any = null;
  private volume = 0.7;
  private onTimeUpdate: ((time: number) => void) | null = null;
  private onError: ((error: string) => void) | null = null;
  private currentTime = 0;
  private duration = 0;

  constructor() {
    // Completely passive constructor - no initialization during SSR
    // All initialization will be done explicitly via initialize() method
  }

  // Public method to initialize when needed
  async initialize(): Promise<void> {
    if (!this.isInitialized && typeof window !== 'undefined') {
      await this.initializeTone();
    }
  }

  private async initializeTone() {
    try {
      if (typeof window === 'undefined') {
        console.log('🎵 Skipping Tone.js initialization (SSR)');
        return;
      }

      // Dynamically import Tone.js only in browser
      if (!Tone) {
        const toneModule = await import('tone');
        Tone = (toneModule as any).default || toneModule;
        console.log('🎵 Tone.js dynamically loaded');
      }

      // Check if Tone is available
      if (!Tone) {
        console.warn('🎵 Tone.js not available, skipping initialization');
        return;
      }

      // Check if user has interacted with the page
      if (Tone.context.state === 'suspended') {
        console.log('🎵 Audio context suspended - waiting for user interaction');
        this.handleError('Audio context suspended. Please click anywhere on the page to enable audio.');
        return;
      }

      // Initialize Tone.js
      await Tone.start();
      console.log('🎵 Tone.js initialized successfully');
      
      // Set up global volume
      Tone.Destination.volume.value = this.volume;
      
      // Initialize basic synths
      this.initializeSynths();
      
      this.isInitialized = true;
      console.log('🎵 Audio service ready');
    } catch (error) {
      console.error('❌ Failed to initialize Tone.js:', error);
      this.handleError('Tone.js initialization failed');
    }
  }

  private initializeSynths() {
    if (!Tone) return;

    // Create different synth types for different instruments
    const synthTypes = {
      'sine': new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { decay: 0.1, sustain: 0.3, release: 0.1 }
      }),
      'triangle': new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { decay: 0.2, sustain: 0.4, release: 0.2 }
      }),
      'sawtooth': new Tone.Synth({
        oscillator: { type: 'sawtooth' },
        envelope: { decay: 0.3, sustain: 0.5, release: 0.3 }
      }),
      'square': new Tone.Synth({
        oscillator: { type: 'square' },
        envelope: { decay: 0.2, sustain: 0.4, release: 0.2 }
      }),
      'ambient': new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { decay: 1.0, sustain: 0.7, release: 2.0 }
      })
    };

    // Add effects to synths
    Object.entries(synthTypes).forEach(([name, synth]) => {
      // Add reverb
      const reverb = new Tone.Reverb(1.5);
      synth.connect(reverb);
      reverb.toDestination();
      
      // Add chorus for richer sound
      const chorus = new Tone.Chorus(1.5, 2.5, 0.5);
      synth.connect(chorus);
      chorus.toDestination();
      
      this.synths.set(name, synth);
    });

    console.log('🎵 Synths initialized:', Array.from(this.synths.keys()));
  }

  private handleError(message: string) {
    console.error('❌ Tone Audio Service Error:', message);
    if (this.onError) {
      this.onError(message);
    }
  }

  // Generate note events from chart data
  generateNoteEvents(chart: any, genre: string = 'ambient'): NoteEvent[] {
    // This method should work even without Tone.js (for SSR compatibility)
    const events: NoteEvent[] = [];
    let currentTime = 0;

    try {
      // Planetary mappings
      const planetaryMappings = {
        Sun: { baseFreq: 264, instrument: 'sawtooth', energy: 0.8 },
        Moon: { baseFreq: 294, instrument: 'sine', energy: 0.6 },
        Mercury: { baseFreq: 330, instrument: 'triangle', energy: 0.7 },
        Venus: { baseFreq: 349, instrument: 'sine', energy: 0.9 },
        Mars: { baseFreq: 392, instrument: 'sawtooth', energy: 0.8 },
        Jupiter: { baseFreq: 440, instrument: 'triangle', energy: 0.7 },
        Saturn: { baseFreq: 494, instrument: 'square', energy: 0.6 },
        Uranus: { baseFreq: 523, instrument: 'sawtooth', energy: 0.8 },
        Neptune: { baseFreq: 587, instrument: 'ambient', energy: 0.5 },
        Pluto: { baseFreq: 659, instrument: 'square', energy: 0.9 }
      };

      // Generate notes from planets
      if (chart.planets) {
        Object.entries(chart.planets).forEach(([planet, data]: [string, any]) => {
          const mapping = planetaryMappings[planet as keyof typeof planetaryMappings];
          if (mapping && data.house) {
            const frequency = this.calculateFrequency(mapping.baseFreq, data.sign_degree || 0, data.house);
            const duration = this.calculateDuration(data.house, mapping.energy);
            const volume = this.calculateVolume(mapping.energy, data.house);

            events.push({
              pitch: frequency,
              duration: duration,
              startTime: currentTime,
              volume: volume,
              instrument: mapping.instrument,
              velocity: mapping.energy
            });

            currentTime += duration + 0.1; // Small gap between notes
          }
        });
      }

      // Generate harmony from aspects
      if (chart.aspects) {
        chart.aspects.forEach((aspect: any) => {
          const harmonyFreq = this.calculateHarmonyFrequency(aspect);
          const duration = 1.0 + (aspect.orb || 0) * 0.5;
          
          events.push({
            pitch: harmonyFreq,
            duration: duration,
            startTime: currentTime,
            volume: 0.6,
            instrument: 'ambient',
            velocity: 0.7
          });

          currentTime += duration + 0.2;
        });
      }

      // Add house-based rhythm
      if (chart.houses) {
        chart.houses.forEach((house: any, index: number) => {
          const tempo = this.calculateTempo(house.number);
          const rhythmFreq = 220 + (index * 55); // Bass frequencies
          
          events.push({
            pitch: rhythmFreq,
            duration: tempo,
            startTime: currentTime,
            volume: 0.4,
            instrument: 'square',
            velocity: 0.5
          });

          currentTime += tempo + 0.1;
        });
      }

      this.duration = currentTime;
      console.log(`🎵 Generated ${events.length} note events, duration: ${this.duration.toFixed(2)}s`);
      
      return events;
    } catch (error) {
      console.error('❌ Error generating note events:', error);
      this.handleError('Failed to generate note events');
      return [];
    }
  }

  private calculateFrequency(baseFreq: number, signDegree: number, house: number): number {
    // Modulate frequency based on sign degree and house
    const modulation = 1 + (signDegree / 360) * 0.5;
    const houseModulation = 1 + (house / 12) * 0.3;
    return baseFreq * modulation * houseModulation;
  }

  private calculateDuration(house: number, energy: number): number {
    // Duration based on house and planetary energy
    const baseDuration = 0.5 + (house / 12) * 1.0;
    return baseDuration * (0.5 + energy * 0.5);
  }

  private calculateVolume(energy: number, house: number): number {
    // Volume based on planetary energy and house
    const baseVolume = 0.3 + energy * 0.4;
    const houseVolume = 0.8 + (house / 12) * 0.2;
    return Math.min(1.0, baseVolume * houseVolume);
  }

  private calculateHarmonyFrequency(aspect: { type: string }): number {
    // Generate harmony frequency based on aspect type
    const baseFreq = 440; // A4
    const aspectModulations: { [key: string]: number } = {
      'conjunction': 1.0,
      'sextile': 1.25,
      'square': 1.5,
      'trine': 1.33,
      'opposition': 2.0
    };
    
    const modulation = aspectModulations[aspect.type] || 1.0;
    return baseFreq * modulation;
  }

  private calculateTempo(houseNumber: number): number {
    // Tempo based on house number
    return 0.3 + (houseNumber / 12) * 0.7;
  }

  // Play note events using Tone.js
  async playNoteEvents(events: NoteEvent[]): Promise<boolean> {
    try {
      // Ensure we're initialized before attempting to play
      if (!this.isInitialized) {
        await this.initialize();
        if (!this.isInitialized) {
          this.handleError('Audio service not initialized');
          return false;
        }
      }

      if (!Tone) {
        console.error('❌ Tone.js not loaded');
        this.handleError('Tone.js not available');
        return false;
      }

      // Check if audio context is suspended (autoplay restriction)
      if (Tone.context.state === 'suspended') {
        console.log('🎵 Audio context suspended - attempting to resume...');
        try {
          await Tone.context.resume();
          console.log('🎵 Audio context resumed successfully');
        } catch (resumeError) {
          console.error('❌ Failed to resume audio context:', resumeError);
          this.handleError('Audio context suspended. Please click anywhere on the page to enable audio playback.');
          return false;
        }
      }

      // Stop any existing playback
      this.stop();

      if (events.length === 0) {
        this.handleError('No note events to play');
        return false;
      }

      console.log('🎵 Playing note events:', events.length);

      // Create a new sequence
      this.currentSequence = new Tone.Part((time: number, event: any) => {
        const synth = this.synths.get(event.instrument || 'sine');
        if (synth) {
          const note = Tone.Frequency(event.pitch).toNote();
          synth.triggerAttackRelease(note, event.duration, time, event.velocity || 0.7);
        }
      }, events.map(event => ({
        time: event.startTime,
        pitch: event.pitch,
        duration: event.duration,
        instrument: event.instrument || 'sine',
        velocity: event.velocity || 0.7
      })));

      // Start playback
      await Tone.start();
      this.currentSequence.start(0);
      
      this.isPlaying = true;
      this.currentTime = 0;
      this.startTimeUpdate();

      console.log('🎵 Playback started successfully');
      return true;
    } catch (error) {
      console.error('❌ Playback error:', error);
      this.handleError(`Failed to start playback: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  private startTimeUpdate(): void {
    if (!this.onTimeUpdate || !Tone) return;

    const updateTime = () => {
      if (this.isPlaying) {
        this.currentTime = Tone.now();
        
        if (this.onTimeUpdate) {
          this.onTimeUpdate(this.currentTime);
        }

        if (this.currentTime >= this.duration) {
          console.log('🎵 Audio playback completed');
          this.stop();
        } else {
          requestAnimationFrame(updateTime);
        }
      }
    };

    requestAnimationFrame(updateTime);
  }

  stop(): void {
    if (this.currentSequence) {
      this.currentSequence.stop();
      this.currentSequence.dispose();
      this.currentSequence = null;
    }
    
    this.isPlaying = false;
    this.currentTime = 0;
    console.log('⏹️ Audio playback stopped');
  }

  pause(): void {
    if (!this.isPlaying) return;

    if (this.currentSequence) {
      this.currentSequence.stop();
    }
    
    this.isPlaying = false;
    console.log('⏸️ Audio playback paused');
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (Tone) {
      Tone.Destination.volume.value = this.volume;
    }
    console.log(`🔊 Volume set to: ${Math.round(this.volume * 100)}%`);
  }

  getVolume(): number {
    return this.volume;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  getDuration(): number {
    return this.duration;
  }

  // Event listeners
  onTimeUpdateCallback(callback: (time: number) => void): void {
    this.onTimeUpdate = callback;
  }

  onErrorCallback(callback: (error: string) => void): void {
    this.onError = callback;
  }

  // Cleanup
  destroy(): void {
    this.stop();
    this.synths.forEach(synth => synth.dispose());
    this.synths.clear();
    console.log('🎵 Audio service destroyed');
  }
}

// Create singleton instance with lazy initialization
let toneAudioServiceInstance: ToneAudioService | null = null;

const getToneAudioService = (): ToneAudioService => {
  if (!toneAudioServiceInstance) {
    toneAudioServiceInstance = new ToneAudioService();
  }
  return toneAudioServiceInstance;
};

export default getToneAudioService; 