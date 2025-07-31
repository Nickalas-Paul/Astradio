// Comprehensive Audio Service for Astradio
// Handles Web Audio API, volume control, and proper error handling

class AudioService {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private isPlaying = false;
  private volume = 0.7; // Default volume
  private currentTime = 0;
  private duration = 0;
  private startTime = 0;
  private onTimeUpdate: ((time: number) => void) | null = null;
  private onError: ((error: string) => void) | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeAudioContext();
  }

  private async initializeAudioContext() {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('🎵 Skipping audio context initialization (SSR)');
        return;
      }
      
      // Create audio context with proper error handling
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = this.volume;
      
      this.isInitialized = true;
      console.log('🎵 Audio context initialized successfully');
      console.log('🎵 Audio context state:', this.audioContext.state);
      console.log('🎵 Sample rate:', this.audioContext.sampleRate);
    } catch (error) {
      console.error('❌ Failed to initialize audio context:', error);
      this.handleError('Audio context initialization failed');
    }
  }

  private handleError(message: string) {
    console.error('❌ Audio Service Error:', message);
    if (this.onError) {
      this.onError(message);
    }
  }

  async loadAudioFromUrl(url: string): Promise<boolean> {
    // Initialize audio context if not already done
    if (!this.audioContext || !this.isInitialized) {
      await this.initializeAudioContext();
      if (!this.audioContext || !this.isInitialized) {
        this.handleError('Audio context not available');
        return false;
      }
    }

    try {
      console.log('🎵 Loading audio from URL:', url);
      console.log('🎵 Audio context state before fetch:', this.audioContext.state);
      
      // Ensure audio context is resumed
      if (this.audioContext.state === 'suspended') {
        console.log('🎵 Resuming suspended audio context...');
        await this.audioContext.resume();
        console.log('🎵 Audio context resumed, new state:', this.audioContext.state);
      }
      
      const response = await fetch(url);
      console.log('🎵 Fetch response status:', response.status);
      console.log('🎵 Fetch response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log('🎵 ArrayBuffer received, size:', arrayBuffer.byteLength, 'bytes');
      
      // Check if buffer is empty or malformed
      if (arrayBuffer.byteLength === 0) {
        throw new Error('Empty audio buffer received');
      }
      
      // Check for minimum valid audio size (WAV header is 44 bytes)
      if (arrayBuffer.byteLength < 44) {
        throw new Error(`Audio buffer too small: ${arrayBuffer.byteLength} bytes`);
      }
      
      console.log('🎵 Decoding audio data...');
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.duration = this.audioBuffer.duration;
      
      console.log('🎵 Audio decoded successfully:', {
        duration: this.audioBuffer.duration,
        sampleRate: this.audioBuffer.sampleRate,
        numberOfChannels: this.audioBuffer.numberOfChannels,
        length: this.audioBuffer.length
      });
      
      return true;
    } catch (error) {
      console.error('❌ Audio loading error:', error);
      this.handleError(`Failed to load audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  async loadAudioFromBuffer(buffer: ArrayBuffer): Promise<boolean> {
    if (!this.audioContext || !this.isInitialized) {
      this.handleError('Audio context not available');
      return false;
    }

    try {
      console.log('🎵 Loading audio from buffer, size:', buffer.byteLength, 'bytes');
      
      if (buffer.byteLength === 0) {
        throw new Error('Empty audio buffer provided');
      }
      
      if (buffer.byteLength < 44) {
        throw new Error(`Audio buffer too small: ${buffer.byteLength} bytes`);
      }
      
      console.log('🎵 Decoding audio buffer...');
      this.audioBuffer = await this.audioContext.decodeAudioData(buffer);
      this.duration = this.audioBuffer.duration;
      
      console.log(`🎵 Audio buffer loaded: ${this.duration.toFixed(2)}s duration`);
      console.log(`🎵 Audio buffer channels: ${this.audioBuffer.numberOfChannels}`);
      console.log(`🎵 Audio buffer sample rate: ${this.audioBuffer.sampleRate}`);
      console.log(`🎵 Audio buffer length: ${this.audioBuffer.length} samples`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to load audio buffer:', error);
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      this.handleError(`Failed to load audio buffer: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  async play(): Promise<boolean> {
    try {
      if (!this.audioContext || !this.audioBuffer) {
        console.error('❌ Cannot play: audio context or buffer not available');
        return false;
      }

      console.log('🎵 Starting playback...');
      console.log('🎵 Audio context state:', this.audioContext.state);
      console.log('🎵 Audio buffer duration:', this.audioBuffer.duration);

      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        console.log('🎵 Resuming audio context...');
        await this.audioContext.resume();
        console.log('🎵 Audio context resumed, new state:', this.audioContext.state);
      }

      // Stop any existing playback
      if (this.sourceNode) {
        console.log('🎵 Stopping existing playback');
        this.sourceNode.stop();
        this.sourceNode.disconnect();
      }

      // Create new source node
      this.sourceNode = this.audioContext.createBufferSource();
      this.sourceNode.buffer = this.audioBuffer;
      
      // Connect to gain node
      if (this.gainNode) {
        this.sourceNode.connect(this.gainNode);
      } else {
        this.sourceNode.connect(this.audioContext.destination);
      }

      // Set up event handlers
      this.sourceNode.onended = () => {
        console.log('🎵 Playback ended naturally');
        this.isPlaying = false;
        this.currentTime = 0;
        this.stopTimeUpdate();
      };

      // Start playback
      this.startTime = this.audioContext.currentTime - this.currentTime;
      this.sourceNode.start(this.audioContext.currentTime, this.currentTime);
      
      this.isPlaying = true;
      this.startTimeUpdate();
      
      console.log('🎵 Playback started successfully');
      return true;
    } catch (error) {
      console.error('❌ Playback error:', error);
      this.handleError(`Failed to start playback: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  pause(): void {
    if (!this.isPlaying) return;

    this.stop();
    this.isPlaying = false;
    console.log('⏸️ Audio playback paused');
  }

  stop(): void {
    if (this.sourceNode) {
      try {
        this.sourceNode.stop();
        console.log('⏹️ Source node stopped');
      } catch (error) {
        console.warn('⚠️ Source node might already be stopped:', error);
      }
      this.sourceNode = null;
    }
    
    this.isPlaying = false;
    this.currentTime = 0;
    this.stopTimeUpdate();
    console.log('⏹️ Audio playback stopped');
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
      console.log(`🔊 Volume set to: ${Math.round(this.volume * 100)}%`);
    } else {
      console.warn('⚠️ GainNode not available for volume control');
    }
  }

  getVolume(): number {
    return this.volume;
  }

  seekToTime(time: number): void {
    if (time < 0 || time > this.duration) {
      console.warn('Invalid seek time:', time, 'Duration:', this.duration);
      return;
    }

    this.currentTime = time;
    
    if (this.isPlaying) {
      this.stop();
      this.play();
    }
    
    console.log(`⏩ Seeked to: ${time.toFixed(2)}s`);
  }

  private startTimeUpdate(): void {
    if (!this.onTimeUpdate) return;

    const updateTime = () => {
      if (this.isPlaying && this.audioContext) {
        this.currentTime = this.audioContext.currentTime - this.startTime;
        
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

  private stopTimeUpdate(): void {
    // Time update is handled by requestAnimationFrame
  }

  // Event listeners
  onTimeUpdateCallback(callback: (time: number) => void): void {
    this.onTimeUpdate = callback;
  }

  onErrorCallback(callback: (error: string) => void): void {
    this.onError = callback;
  }

  // Getters
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  getDuration(): number {
    return this.duration;
  }

  // Cleanup
  destroy(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      console.log('🎵 Audio context closed');
    }
  }
}

// Create singleton instance
const audioService = new AudioService();

export default audioService; 