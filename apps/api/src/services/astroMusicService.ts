// Astrological Music Service for Backend
// Handles chart-to-music conversion and provides API endpoints

import { AstroChart, PlanetData, AspectData } from '../types';
import { AudioGenerator } from '@astradio/audio-mappings';

export interface MusicGenerationRequest {
  chartData: AstroChart;
  genre: string;
  duration: number;
  volume: number;
}

export interface MusicGenerationResponse {
  success: boolean;
  audioUrl?: string;
  duration: number;
  genre: string;
  notes: any[];
  error?: string;
}

class AstroMusicService {
  private audioGenerator: AudioGenerator;

  constructor() {
    this.audioGenerator = new AudioGenerator();
  }

  // Generate music from astrological chart data
  async generateMusicFromChart(request: MusicGenerationRequest): Promise<MusicGenerationResponse> {
    try {
      console.log('🎵 Generating music from chart data:', {
        planets: Object.keys(request.chartData.planets || {}).length,
        aspects: request.chartData.aspects?.length || 0,
        genre: request.genre,
        duration: request.duration
      });

      // Validate chart data
      if (!request.chartData.planets || Object.keys(request.chartData.planets).length === 0) {
        throw new Error('No planetary data available for music generation');
      }

      // Convert chart data to audio composition
      const composition = this.audioGenerator.generateChartAudio(
        request.chartData,
        request.duration,
        request.genre
      );

      console.log(`🎵 Generated composition with ${composition.notes.length} notes`);

      // Generate WAV buffer
      const wavBuffer = this.audioGenerator.generateWAVBuffer(composition);

      // In a real implementation, you would save this to a file or stream
      // For now, we'll return the composition data
      return {
        success: true,
        duration: request.duration,
        genre: request.genre,
        notes: composition.notes.map(note => ({
          frequency: note.frequency,
          duration: note.duration,
          volume: note.volume,
          instrument: note.instrument,
          startTime: note.startTime,
          planet: note.planet,
          sign: note.sign,
          house: note.house
        }))
      };

    } catch (error) {
      console.error('❌ Music generation failed:', error);
      return {
        success: false,
        duration: 0,
        genre: request.genre,
        notes: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Generate daily music based on today's chart
  async generateDailyMusic(genre: string = 'ambient', duration: number = 60): Promise<MusicGenerationResponse> {
    try {
      console.log('🎵 Generating daily music:', { genre, duration });

      // Get today's chart data
      const today = new Date();
      const chartData = await this.getDailyChartData(today);

      return await this.generateMusicFromChart({
        chartData,
        genre,
        duration,
        volume: 0.7
      });

    } catch (error) {
      console.error('❌ Daily music generation failed:', error);
      return {
        success: false,
        duration: 0,
        genre,
        notes: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get daily chart data (simplified for demo)
  private async getDailyChartData(date: Date): Promise<AstroChart> {
    // This would normally use Swiss Ephemeris
    // For now, return a simplified chart
    return {
      planets: {
        Sun: {
          longitude: 15,
          sign: { name: 'Aries', element: 'Fire', degree: 15, modality: 'Cardinal' },
          house: 1,
          retrograde: false
        },
        Moon: {
          longitude: 45,
          sign: { name: 'Taurus', element: 'Earth', degree: 15, modality: 'Fixed' },
          house: 2,
          retrograde: false
        },
        Mercury: {
          longitude: 330,
          sign: { name: 'Pisces', element: 'Water', degree: 0, modality: 'Mutable' },
          house: 12,
          retrograde: false
        },
        Venus: {
          longitude: 312,
          sign: { name: 'Aquarius', element: 'Air', degree: 12, modality: 'Fixed' },
          house: 11,
          retrograde: false
        },
        Mars: {
          longitude: 240,
          sign: { name: 'Sagittarius', element: 'Fire', degree: 0, modality: 'Mutable' },
          house: 9,
          retrograde: false
        },
        Jupiter: {
          longitude: 95,
          sign: { name: 'Cancer', element: 'Water', degree: 5, modality: 'Cardinal' },
          house: 4,
          retrograde: false
        },
        Saturn: {
          longitude: 288,
          sign: { name: 'Capricorn', element: 'Earth', degree: 18, modality: 'Cardinal' },
          house: 10,
          retrograde: false
        },
        Uranus: {
          longitude: 322,
          sign: { name: 'Aquarius', element: 'Air', degree: 22, modality: 'Fixed' },
          house: 11,
          retrograde: false
        },
        Neptune: {
          longitude: 333,
          sign: { name: 'Pisces', element: 'Water', degree: 3, modality: 'Mutable' },
          house: 12,
          retrograde: false
        },
        Pluto: {
          longitude: 298,
          sign: { name: 'Capricorn', element: 'Earth', degree: 28, modality: 'Cardinal' },
          house: 10,
          retrograde: false
        }
      },
      houses: {
        1: { cusp_longitude: 0, sign: { name: 'Aries', element: 'Fire', degree: 0, modality: 'Cardinal' } },
        2: { cusp_longitude: 30, sign: { name: 'Taurus', element: 'Earth', degree: 0, modality: 'Fixed' } },
        3: { cusp_longitude: 60, sign: { name: 'Gemini', element: 'Air', degree: 0, modality: 'Mutable' } },
        4: { cusp_longitude: 90, sign: { name: 'Cancer', element: 'Water', degree: 0, modality: 'Cardinal' } },
        5: { cusp_longitude: 120, sign: { name: 'Leo', element: 'Fire', degree: 0, modality: 'Fixed' } },
        6: { cusp_longitude: 150, sign: { name: 'Virgo', element: 'Earth', degree: 0, modality: 'Mutable' } },
        7: { cusp_longitude: 180, sign: { name: 'Libra', element: 'Air', degree: 0, modality: 'Cardinal' } },
        8: { cusp_longitude: 210, sign: { name: 'Scorpio', element: 'Water', degree: 0, modality: 'Fixed' } },
        9: { cusp_longitude: 240, sign: { name: 'Sagittarius', element: 'Fire', degree: 0, modality: 'Mutable' } },
        10: { cusp_longitude: 270, sign: { name: 'Capricorn', element: 'Earth', degree: 0, modality: 'Cardinal' } },
        11: { cusp_longitude: 300, sign: { name: 'Aquarius', element: 'Air', degree: 0, modality: 'Fixed' } },
        12: { cusp_longitude: 330, sign: { name: 'Pisces', element: 'Water', degree: 0, modality: 'Mutable' } }
      },
      aspects: [
        {
          planet1: 'Sun',
          planet2: 'Moon',
          type: 'conjunction',
          angle: 30,
          harmonic: '1'
        },
        {
          planet1: 'Venus',
          planet2: 'Mars',
          type: 'trine',
          angle: 120,
          harmonic: '3'
        }
      ],
      metadata: {
        conversion_method: 'simplified',
        ayanamsa_correction: 0,
        birth_datetime: date.toISOString(),
        coordinate_system: 'tropical'
      }
    };
  }

  // Get available genres
  getAvailableGenres(): string[] {
    return ['ambient', 'techno', 'world', 'hip-hop', 'folk', 'jazz', 'classical', 'electronic', 'rock', 'blues', 'chill'];
  }

  // Get genre information
  getGenreInfo(genre: string): { name: string; description: string; characteristics: string[] } {
    const genreInfo: Record<string, { name: string; description: string; characteristics: string[] }> = {
      ambient: {
        name: 'Ambient',
        description: 'Peaceful, atmospheric sounds perfect for meditation and relaxation',
        characteristics: ['Slow tempo', 'Atmospheric textures', 'Minimal percussion', 'Harmonic drones']
      },
      techno: {
        name: 'Techno',
        description: 'Electronic, rhythmic beats with industrial influences',
        characteristics: ['Fast tempo', 'Electronic instruments', 'Repetitive patterns', 'Heavy bass']
      },
      world: {
        name: 'World',
        description: 'Global, cultural influences from around the world',
        characteristics: ['Ethnic instruments', 'Cultural rhythms', 'Organic sounds', 'Diverse scales']
      },
      'hip-hop': {
        name: 'Hip-Hop',
        description: 'Urban, rhythmic patterns with strong beats',
        characteristics: ['Strong beats', 'Urban rhythms', 'Bass-heavy', 'Rhythmic patterns']
      }
    };

    return genreInfo[genre] || genreInfo['ambient'];
  }
}

export default AstroMusicService;
