export interface SandboxAudioConfig {
  tempo: number;
  duration: number;
  volume: number;
  reverb: number;
  delay: number;
  genre: string;
}

export interface SandboxAudioSession {
  id: string;
  chartData: any;
  aspects: any[];
  config: SandboxAudioConfig;
  audioUrl?: string;
  createdAt: Date;
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export class SandboxAudioService {
  private currentSession: SandboxAudioSession | null = null;
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private isPlaying = false;
  private sourceNode: AudioBufferSourceNode | null = null;

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

  private async initializeAudioContext() {
    try {
      if (!isBrowser) {
        console.log('🎵 Skipping audio context initialization (SSR)');
        return;
      }
      
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  async generateAudio(
    chartData: any,
    aspects: any[],
    config: SandboxAudioConfig
  ): Promise<SandboxAudioSession> {
    const session: SandboxAudioSession = {
      id: `sandbox_${Date.now()}`,
      chartData,
      aspects,
      config,
      createdAt: new Date()
    };

    try {
      const response = await fetch('/api/audio/sandbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chart_data: chartData,
          aspects,
          configuration: config,
          mode: 'sandbox',
          genre: config.genre
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        session.audioUrl = data.data.audioUrl;
        this.currentSession = session;
        return session;
      } else {
        throw new Error(data.error || 'Failed to generate sandbox audio');
      }
    } catch (error) {
      console.error('Audio generation failed:', error);
      throw error;
    }
  }

  async playAudio(): Promise<void> {
    if (!this.currentSession?.audioUrl || !this.audioContext) {
      throw new Error('No audio session available');
    }

    try {
      const response = await fetch(this.currentSession.audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.sourceNode = this.audioContext.createBufferSource();
      this.sourceNode.buffer = this.audioBuffer;
      
      // Create effects chain
      const gainNode = this.audioContext.createGain();
      const reverbNode = this.createReverb();
      const delayNode = this.createDelay();
      
      // Connect nodes
      this.sourceNode
        .connect(gainNode)
        .connect(reverbNode)
        .connect(delayNode)
        .connect(this.audioContext.destination);
      
      gainNode.gain.value = this.currentSession.config.volume;
      
      this.sourceNode.onended = () => {
        this.isPlaying = false;
      };
      
      this.sourceNode.start(0);
      this.isPlaying = true;
    } catch (error) {
      console.error('Failed to play audio:', error);
      throw error;
    }
  }

  stopAudio(): void {
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode = null;
    }
    this.isPlaying = false;
  }

  pauseAudio(): void {
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode = null;
    }
    this.isPlaying = false;
  }

  private createReverb(): AudioNode {
    if (!this.audioContext) return this.audioContext!.destination;
    
    const convolver = this.audioContext.createConvolver();
    const gainNode = this.audioContext.createGain();
    
    // Simple reverb effect
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * 0.5; // 0.5 second reverb
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.1));
      }
    }
    
    convolver.buffer = impulse;
    gainNode.gain.value = this.currentSession?.config.reverb || 0.3;
    
    convolver.connect(gainNode);
    return gainNode;
  }

  private createDelay(): AudioNode {
    if (!this.audioContext) return this.audioContext!.destination;
    
    const delay = this.audioContext.createDelay(1.0);
    const feedback = this.audioContext.createGain();
    const output = this.audioContext.createGain();
    
    delay.delayTime.value = 0.3;
    feedback.gain.value = 0.3;
    output.gain.value = this.currentSession?.config.delay || 0.1;
    
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(output);
    
    return output;
  }

  async exportAudio(filename?: string): Promise<void> {
    if (!this.currentSession?.audioUrl) {
      throw new Error('No audio session to export');
    }

    try {
      const response = await fetch(this.currentSession.audioUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `sandbox_composition_${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export audio:', error);
      throw error;
    }
  }

  saveSession(): void {
    if (!this.currentSession) return;
    
    try {
      const sessions = JSON.parse(localStorage.getItem('sandbox_sessions') || '[]');
      sessions.push(this.currentSession);
      localStorage.setItem('sandbox_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  loadSession(sessionId: string): SandboxAudioSession | null {
    try {
      const sessions = JSON.parse(localStorage.getItem('sandbox_sessions') || '[]');
      return sessions.find((s: SandboxAudioSession) => s.id === sessionId) || null;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }

  getSavedSessions(): SandboxAudioSession[] {
    try {
      return JSON.parse(localStorage.getItem('sandbox_sessions') || '[]');
    } catch (error) {
      console.error('Failed to get saved sessions:', error);
      return [];
    }
  }

  getCurrentSession(): SandboxAudioSession | null {
    return this.currentSession;
  }

  isAudioPlaying(): boolean {
    return this.isPlaying;
  }

  reset(): void {
    this.stopAudio();
    this.currentSession = null;
    this.audioBuffer = null;
  }
}

export const sandboxAudioService = new SandboxAudioService(); 