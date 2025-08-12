// Simple browser audio engine for web app
export class SimpleBrowserAudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private oscillators: OscillatorNode[] = [];

  async initialize(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3;
      console.log('🎵 Audio context initialized');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw error;
    }
  }

  async playNote(frequency: number, duration: number, type: OscillatorType = 'sine'): Promise<void> {
    if (!this.audioContext || !this.masterGain) {
      throw new Error('Audio context not initialized');
    }

    // Resume audio context if suspended (required for user gesture)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    // Set up envelope
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.1); // Attack
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime + duration - 0.2); // Sustain
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration); // Release

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);

    this.oscillators.push(oscillator);

    // Clean up oscillator when done
    oscillator.onended = () => {
      this.oscillators = this.oscillators.filter(osc => osc !== oscillator);
    };
  }

  async playChartSequence(planetMappings: any[]): Promise<void> {
    if (!planetMappings || planetMappings.length === 0) {
      console.warn('No planet mappings to play');
      return;
    }

    this.isPlaying = true;
    const noteDuration = 2; // 2 seconds per note
    
    for (let i = 0; i < planetMappings.length && this.isPlaying; i++) {
      const mapping = planetMappings[i];
      console.log(`🎵 Playing ${mapping.planet}: ${mapping.frequency}Hz`);
      
      await this.playNote(
        mapping.frequency, 
        noteDuration, 
        this.getOscillatorType(mapping.instrument)
      );
      
      // Wait before next note
      if (i < planetMappings.length - 1) {
        await new Promise(resolve => setTimeout(resolve, noteDuration * 500)); // 50% overlap
      }
    }
    
    this.isPlaying = false;
  }

  private getOscillatorType(instrument: string): OscillatorType {
    switch (instrument) {
      case 'sine': return 'sine';
      case 'square': return 'square';
      case 'sawtooth': return 'sawtooth';
      case 'triangle': return 'triangle';
      default: return 'sine';
    }
  }

  stop(): void {
    this.isPlaying = false;
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Oscillator may already be stopped
      }
    });
    this.oscillators = [];
  }

  pause(): void {
    this.isPlaying = false;
    // For this simple implementation, pause is the same as stop
    // In a more complex implementation, you'd store the current state
  }

  resume(): void {
    // For this simple implementation, resume just sets playing to true
    // In a more complex implementation, you'd restore the previous state
    this.isPlaying = true;
  }

  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  dispose(): void {
    this.stop();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.audioContext = null;
    this.masterGain = null;
  }
}
