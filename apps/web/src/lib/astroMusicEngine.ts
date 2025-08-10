// Frontend astro music engine using API calls and simple browser audio
import { SimpleBrowserAudioEngine } from './simpleAudioEngine';
import { AudioConfig, PlanetAudioMapping, AstroChart, DailyChartResponse } from '../types/index';

export class FrontendAstroMusicEngine {
  private audioEngine: SimpleBrowserAudioEngine;
  private currentTrackId: string | null = null;
  private planetMappings: PlanetAudioMapping[] = [];

  constructor() {
    this.audioEngine = new SimpleBrowserAudioEngine();
  }

  async initialize(): Promise<void> {
    await this.audioEngine.initialize();
  }

  async loadDailyChart(genre: 'ambient' | 'techno' | 'world' | 'hip-hop' = 'ambient'): Promise<void> {
    try {
      console.log('🎵 Loading daily chart with genre:', genre);
      
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${base}/api/daily?genre=${genre}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: new Date().toISOString(),
          location: {
            latitude: 51.4769, // Default to Greenwich
            longitude: 0.0005,
            timezone: 0
          }
        }),
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch daily chart: ${response.statusText}`);
      }

      const data: DailyChartResponse = await response.json();
      
      console.log('🎵 Daily chart loaded:', {
        track_id: data.track_id,
        genre: data.audio_config.genre,
        tempo: data.audio_config.tempo,
        key: data.audio_config.key,
        planet_mappings: data.planet_mappings.length
      });

      this.currentTrackId = data.track_id;

      // Store the planet mappings for playback
      this.planetMappings = data.planet_mappings;

    } catch (error) {
      console.error('❌ Failed to load daily chart:', error);
      throw error;
    }
  }

  // Simplified method that just stores data for playback
  setChartData(planetMappings: PlanetAudioMapping[]): void {
    this.planetMappings = planetMappings;
    this.currentTrackId = `custom_${Date.now()}`;
  }

  async play(): Promise<void> {
    try {
      if (this.planetMappings.length === 0) {
        console.warn('No planet mappings loaded for playback');
        return;
      }
      await this.audioEngine.playChartSequence(this.planetMappings);
      console.log('🎵 Audio playback started');
    } catch (error) {
      console.error('❌ Failed to start playback:', error);
      throw error;
    }
  }

  stop(): void {
    this.audioEngine.stop();
    console.log('🎵 Audio playback stopped');
  }

  pause(): void {
    this.audioEngine.pause();
    console.log('🎵 Audio playback paused');
  }

  resume(): void {
    this.audioEngine.resume();
    console.log('🎵 Audio playback resumed');
  }

  setVolume(volume: number): void {
    this.audioEngine.setVolume(Math.max(0, Math.min(1, volume)));
  }

  isPlaying(): boolean {
    return this.audioEngine.isCurrentlyPlaying();
  }

  getCurrentTrackId(): string | null {
    return this.currentTrackId;
  }

  dispose(): void {
    this.audioEngine.dispose();
    this.currentTrackId = null;
    console.log('🎵 Audio engine disposed');
  }

  // Static method to get available genres
  static getAvailableGenres(): Array<{
    id: 'ambient' | 'techno' | 'world' | 'hip-hop';
    name: string;
    description: string;
    tempo_range: string;
    characteristics: string[];
  }> {
    return [
      {
        id: 'ambient',
        name: 'Ambient',
        description: 'Ethereal, spacious soundscapes perfect for meditation',
        tempo_range: '60-80 BPM',
        characteristics: ['Reverb-heavy', 'Drone elements', 'Minimal rhythm']
      },
      {
        id: 'techno',
        name: 'Techno',
        description: 'Driving electronic beats with synthetic textures',
        tempo_range: '120-140 BPM',
        characteristics: ['Four-on-the-floor', 'Synthesized', 'Hypnotic']
      },
      {
        id: 'world',
        name: 'World Music',
        description: 'Organic instruments with global influences',
        tempo_range: '80-110 BPM',
        characteristics: ['Natural timbres', 'Modal scales', 'Cultural fusion']
      },
      {
        id: 'hip-hop',
        name: 'Hip-Hop',
        description: 'Rhythmic beats with urban energy',
        tempo_range: '80-100 BPM',
        characteristics: ['Strong backbeat', 'Sampled elements', 'Groove-focused']
      }
    ];
  }
}