// Unified Audio Controller for Astradio
// Handles both API-generated WAV files and real-time Tone.js generation

// Remove top-level import to prevent SSR issues
// import getToneAudioService from './toneAudioService';

export interface AudioPlaybackOptions {
  mode: 'api' | 'realtime';
  genre?: string;
  duration?: number;
  chartData?: any;
}

export interface AudioStatus {
  isLoading: boolean;
  isPlaying: boolean;
  error: string | null;
  currentTime: number;
  duration: number;
  mode: 'api' | 'realtime' | null;
}

class UnifiedAudioController {
  private currentMode: 'api' | 'realtime' | null = null;
  private audioStatus: AudioStatus = {
    isLoading: false,
    isPlaying: false,
    error: null,
    currentTime: 0,
    duration: 0,
    mode: null
  };
  private onStatusChange: ((status: AudioStatus) => void) | null = null;
  private audioService: any = null;
  private toneAudioService: any = null;

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.initializeServices();
    }
  }

  private async initializeServices() {
    try {
      // Initialize audioService dynamically
      const { default: audioService } = await import('./audioService');
      this.audioService = audioService;
      
      this.setupAudioServiceCallbacks();
      this.setupToneServiceCallbacks();
    } catch (error) {
      console.error('Failed to initialize audio services:', error);
    }
  }

  private setupAudioServiceCallbacks() {
    if (typeof window === 'undefined' || !this.audioService) return;
    
    this.audioService.onTimeUpdateCallback((time: number) => {
      this.updateStatus({
        currentTime: time,
        isPlaying: this.audioService.getIsPlaying()
      });
    });

    this.audioService.onErrorCallback((error: string) => {
      this.updateStatus({
        isLoading: false,
        isPlaying: false,
        error
      });
    });
  }

  private async setupToneServiceCallbacks() {
    if (typeof window === 'undefined') return;
    
    try {
      // Dynamic import to prevent SSR issues
      const { default: getToneAudioService } = await import('./toneAudioService');
      this.toneAudioService = getToneAudioService();
      
      this.toneAudioService.onTimeUpdateCallback((time: number) => {
        this.updateStatus({
          currentTime: time,
          isPlaying: this.toneAudioService.getIsPlaying()
        });
      });

      this.toneAudioService.onErrorCallback((error: string) => {
        this.updateStatus({
          isLoading: false,
          isPlaying: false,
          error
        });
      });
    } catch (error) {
      console.error('Failed to initialize tone audio service:', error);
    }
  }

  private updateStatus(updates: Partial<AudioStatus>) {
    this.audioStatus = { ...this.audioStatus, ...updates };
    if (this.onStatusChange) {
      this.onStatusChange(this.audioStatus);
    }
  }

  // Play daily audio using API-generated WAV file
  async playDailyAudio(genre: string = 'ambient', duration: number = 60): Promise<boolean> {
    try {
      this.updateStatus({
        isLoading: true,
        error: null,
        mode: 'api'
      });

      console.log('🎵 Playing daily audio via API...');
      
      const apiUrl = `/api/audio/daily?genre=${genre}&duration=${duration}`;
      const success = await this.audioService.loadAudioFromAPI(apiUrl);
      
      if (success) {
        const playSuccess = await this.audioService.play();
        this.updateStatus({
          isLoading: false,
          isPlaying: playSuccess,
          duration: this.audioService.getDuration()
        });
        return playSuccess;
      } else {
        this.updateStatus({
          isLoading: false,
          isPlaying: false,
          error: 'Failed to load daily audio'
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Daily audio playback failed:', error);
      this.updateStatus({
        isLoading: false,
        isPlaying: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  // Play chart audio using real-time Tone.js generation
  async playChartAudio(chartData: any, genre: string = 'ambient'): Promise<boolean> {
    try {
      this.updateStatus({
        isLoading: true,
        error: null,
        mode: 'realtime'
      });

      console.log('🎵 Playing chart audio via real-time generation...');
      
      // Ensure tone service is initialized
      if (!this.toneAudioService) {
        const { default: getToneAudioService } = await import('./toneAudioService');
        this.toneAudioService = getToneAudioService();
      }
      
      const noteEvents = this.toneAudioService.generateNoteEvents(chartData, genre);
      
      if (noteEvents.length === 0) {
        throw new Error('No musical events generated from chart data');
      }

      const success = await this.toneAudioService.playNoteEvents(noteEvents);
      
      this.updateStatus({
        isLoading: false,
        isPlaying: success,
        duration: this.toneAudioService.getDuration()
      });
      
      return success;
    } catch (error) {
      console.error('❌ Chart audio playback failed:', error);
      this.updateStatus({
        isLoading: false,
        isPlaying: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  // Play overlay audio using real-time generation
  async playOverlayAudio(chart1: any, chart2: any, genre: string = 'ambient'): Promise<boolean> {
    try {
      this.updateStatus({
        isLoading: true,
        error: null,
        mode: 'realtime'
      });

      console.log('🎵 Playing overlay audio via real-time generation...');
      
      const mergedChartData = {
        ...chart1,
        overlay_chart: chart2,
        mode: 'overlay'
      };
      
      // Ensure tone service is initialized
      if (!this.toneAudioService) {
        const { default: getToneAudioService } = await import('./toneAudioService');
        this.toneAudioService = getToneAudioService();
      }
      
      const noteEvents = this.toneAudioService.generateNoteEvents(mergedChartData, genre);
      
      if (noteEvents.length === 0) {
        throw new Error('No musical events generated from overlay data');
      }

      const success = await this.toneAudioService.playNoteEvents(noteEvents);
      
      this.updateStatus({
        isLoading: false,
        isPlaying: success,
        duration: this.toneAudioService.getDuration()
      });
      
      return success;
    } catch (error) {
      console.error('❌ Overlay audio playback failed:', error);
      this.updateStatus({
        isLoading: false,
        isPlaying: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  // Stop current playback
  stop(): void {
    console.log('⏹️ Stopping audio playback...');
    
    if (this.currentMode === 'api') {
      this.audioService.stop();
    } else if (this.currentMode === 'realtime' && this.toneAudioService) {
      this.toneAudioService.stop();
    }
    
    this.updateStatus({
      isPlaying: false,
      currentTime: 0
    });
  }

  // Pause current playback
  pause(): void {
    console.log('⏸️ Pausing audio playback...');
    
    if (this.currentMode === 'api') {
      this.audioService.pause();
    } else if (this.currentMode === 'realtime' && this.toneAudioService) {
      this.toneAudioService.pause();
    }
    
    this.updateStatus({
      isPlaying: false
    });
  }

  // Set volume
  setVolume(volume: number): void {
    if (this.currentMode === 'api') {
      this.audioService.setVolume(volume);
    } else if (this.currentMode === 'realtime' && this.toneAudioService) {
      this.toneAudioService.setVolume(volume);
    }
  }

  // Get current status
  getStatus(): AudioStatus {
    return { ...this.audioStatus };
  }

  // Set status change callback
  onStatusChangeCallback(callback: (status: AudioStatus) => void): void {
    this.onStatusChange = callback;
  }

  // Cleanup
  destroy(): void {
    this.stop();
    if (this.audioService) {
      this.audioService.destroy();
    }
    if (this.toneAudioService) {
      this.toneAudioService.destroy();
    }
  }
}

// Create singleton instance
let unifiedAudioControllerInstance: UnifiedAudioController | null = null;

const getUnifiedAudioController = (): UnifiedAudioController => {
  if (!unifiedAudioControllerInstance) {
    unifiedAudioControllerInstance = new UnifiedAudioController();
  }
  return unifiedAudioControllerInstance;
};

export default getUnifiedAudioController; 