// Audio Context Management for Astradio
// Handles browser autoplay policies and user interaction requirements

let audioContextInitialized = false;
let audioContext: AudioContext | null = null;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export const initializeAudioContext = async (): Promise<void> => {
  if (audioContextInitialized || !isBrowser) return;
  
  try {
    // Create audio context
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    console.log('🎵 Audio context created, state:', audioContext.state);
    
    // Add click listener to start audio context on first user interaction
    const startAudioOnInteraction = async () => {
      try {
        if (audioContext && audioContext.state === 'suspended') {
          await audioContext.resume();
          console.log('🎵 Audio context resumed on user interaction');
        }
        
        audioContextInitialized = true;
        
        // Remove the listener after first interaction
        document.removeEventListener('click', startAudioOnInteraction);
        document.removeEventListener('touchstart', startAudioOnInteraction);
        document.removeEventListener('keydown', startAudioOnInteraction);
      } catch (error) {
        console.warn('⚠️ Failed to initialize audio context:', error);
      }
    };
    
    // Add listeners for user interaction
    document.addEventListener('click', startAudioOnInteraction);
    document.addEventListener('touchstart', startAudioOnInteraction);
    document.addEventListener('keydown', startAudioOnInteraction);
    
    console.log('🎵 Audio context listeners added');
  } catch (error) {
    console.warn('⚠️ Audio context initialization failed:', error);
  }
};

export const ensureAudioContext = async (): Promise<boolean> => {
  try {
    if (!isBrowser) return false;
    
    // If we don't have an audio context, create one
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🎵 Created new audio context');
    }
    
    if (audioContext.state === 'suspended') {
      console.log('🎵 Audio context suspended, attempting to resume...');
      await audioContext.resume();
      console.log('🎵 Audio context state:', audioContext.state);
    }
    
    // Additional debugging
    console.log('🎵 Audio Context Debug:', {
      state: audioContext.state,
      sampleRate: audioContext.sampleRate,
      currentTime: audioContext.currentTime,
      destination: audioContext.destination ? 'connected' : 'not connected',
      userAgent: navigator.userAgent
    });
    
    return audioContext.state === 'running';
  } catch (error) {
    console.warn('⚠️ Audio context check failed:', error);
    return false;
  }
};

export const logAudioContextState = async (): Promise<void> => {
  try {
    if (!isBrowser || !audioContext) return;
    
    console.log('🎵 Audio Context State:', {
      state: audioContext.state,
      sampleRate: audioContext.sampleRate,
      currentTime: audioContext.currentTime,
      destination: audioContext.destination ? 'connected' : 'not connected'
    });
  } catch (error) {
    console.warn('⚠️ Could not log audio context state:', error);
  }
};

export const getAudioContext = (): AudioContext | null => {
  return audioContext;
}; 

class AudioContextService {
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private isMuted = false;
  private currentTime = 0;
  private duration = 0;
  private startTime = 0;
  private houseOffsets: number[] = [];
  private onTimeUpdate: ((time: number) => void) | null = null;
  private onHouseChange: ((house: number) => void) | null = null;

  constructor() {
    // Completely passive constructor - no initialization during SSR
    // All initialization will be done explicitly via initialize() method
  }

  // Public method to initialize when needed
  async initialize(): Promise<void> {
    if (!this.audioContext && isBrowser) {
      await this.initializeAudioContext();
    }
  }

  private initializeAudioContext() {
    try {
      if (!isBrowser) {
        console.log('🎵 Skipping audio context initialization (SSR)');
        return;
      }
      
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      console.log('Audio context initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  async loadAudioFromUrl(url: string): Promise<void> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.duration = this.audioBuffer.duration;
      
      // Calculate house offsets (12 houses, equal time distribution)
      this.houseOffsets = Array.from({ length: 12 }, (_, i) => (i * this.duration) / 12);
      
      console.log(`Audio loaded: ${this.duration}s duration, ${this.houseOffsets.length} houses`);
    } catch (error) {
      console.error('Failed to load audio:', error);
      throw error;
    }
  }

  async loadAudioFromBuffer(buffer: ArrayBuffer): Promise<void> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    try {
      this.audioBuffer = await this.audioContext.decodeAudioData(buffer);
      this.duration = this.audioBuffer.duration;
      
      // Calculate house offsets (12 houses, equal time distribution)
      this.houseOffsets = Array.from({ length: 12 }, (_, i) => (i * this.duration) / 12);
      
      console.log(`Audio loaded: ${this.duration}s duration, ${this.houseOffsets.length} houses`);
    } catch (error) {
      console.error('Failed to load audio buffer:', error);
      throw error;
    }
  }

  play(): void {
    if (!this.audioContext || !this.audioBuffer || this.isPlaying) {
      return;
    }

    try {
      this.sourceNode = this.audioContext.createBufferSource();
      this.sourceNode.buffer = this.audioBuffer;
      this.sourceNode.connect(this.gainNode!);
      
      this.startTime = this.audioContext.currentTime - this.currentTime;
      this.sourceNode.start(0, this.currentTime);
      
      this.isPlaying = true;
      this.startTimeUpdate();
      
      console.log('Audio playback started');
    } catch (error) {
      console.error('Failed to start playback:', error);
    }
  }

  pause(): void {
    if (!this.isPlaying) {
      return;
    }

    this.stop();
    this.isPlaying = false;
    console.log('Audio playback paused');
  }

  stop(): void {
    if (this.sourceNode) {
      try {
        this.sourceNode.stop();
      } catch (error) {
        // Source node might already be stopped
      }
      this.sourceNode = null;
    }
    
    this.isPlaying = false;
    this.currentTime = 0;
    this.stopTimeUpdate();
    console.log('Audio playback stopped');
  }

  seekToHouse(houseNumber: number): void {
    if (houseNumber < 1 || houseNumber > 12) {
      console.warn('Invalid house number:', houseNumber);
      return;
    }

    const houseIndex = houseNumber - 1;
    const newTime = this.houseOffsets[houseIndex];
    
    if (this.isPlaying) {
      this.stop();
      this.currentTime = newTime;
      this.play();
    } else {
      this.currentTime = newTime;
    }

    if (this.onHouseChange) {
      this.onHouseChange(houseNumber);
    }

    console.log(`Seeked to house ${houseNumber} at ${newTime.toFixed(2)}s`);
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.gainNode) {
      this.gainNode.gain.value = muted ? 0 : 1;
    }
    console.log(`Audio ${muted ? 'muted' : 'unmuted'}`);
  }

  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  private startTimeUpdate(): void {
    if (!this.onTimeUpdate) return;

    const updateTime = () => {
      if (this.isPlaying && this.audioContext) {
        this.currentTime = this.audioContext.currentTime - this.startTime;
        
        if (this.onTimeUpdate) {
          this.onTimeUpdate(this.currentTime);
        }

        // Check if we should change house
        const currentHouse = this.getCurrentHouse();
        if (this.onHouseChange) {
          this.onHouseChange(currentHouse);
        }

        if (this.currentTime >= this.duration) {
          this.stop();
        } else {
          requestAnimationFrame(updateTime);
        }
      }
    };

    requestAnimationFrame(updateTime);
  }

  private stopTimeUpdate(): void {
    // Time update is handled by requestAnimationFrame, so we just stop calling it
  }

  private getCurrentHouse(): number {
    for (let i = 0; i < this.houseOffsets.length; i++) {
      if (this.currentTime < this.houseOffsets[i]) {
        return i;
      }
    }
    return 12; // Last house
  }

  // Event listeners
  onTimeUpdateCallback(callback: (time: number) => void): void {
    this.onTimeUpdate = callback;
  }

  onHouseChangeCallback(callback: (house: number) => void): void {
    this.onHouseChange = callback;
  }

  // Getters
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getIsMuted(): boolean {
    return this.isMuted;
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  getDuration(): number {
    return this.duration;
  }

  getCurrentHouseNumber(): number {
    return this.getCurrentHouse();
  }

  // Cleanup
  destroy(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Create singleton instance
const audioContextService = new AudioContextService();

export default audioContextService; 