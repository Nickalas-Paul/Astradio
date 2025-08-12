// Basic types for web app
export interface PlanetData {
  longitude: number;
  sign: SignData;
  house: number;
  retrograde: boolean;
}

export interface SignData {
  name: string;
  degree: number;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
}

export interface AspectData {
  planet1: string;
  planet2: string;
  type: string;
  angle: number;
  harmonic: string;
}

export interface AstroChart {
  planets: { [key: string]: PlanetData };
  houses: { [key: string]: any };
  aspects?: AspectData[];
  metadata: {
    conversion_method: string;
    ayanamsa_correction: number;
    birth_datetime: string;
    coordinate_system: string;
  };
}

// Import GenreType from the single source of truth
import type { GenreType } from '../lib/genreSystem';
export type MoodType = 'calm' | 'energetic' | 'mystical' | 'grounded';

export interface AudioConfig {
  genre: GenreType;
  tempo: number;
  key: string;
  scale: string[];
  duration: number;
}

// Import GenreConfiguration from the single source of truth
import type { GenreConfiguration } from '../lib/genreSystem';

export interface MoodConfiguration {
  volume: number;
  reverb: number;
  delay: number;
  filter: number;
}

export interface PlanetAudioMapping {
  planet: string;
  instrument: string;
  frequency: number;
  volume: number;
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
}

export interface DailyChartResponse {
  chart: AstroChart;
  audio_config: AudioConfig;
  planet_mappings: PlanetAudioMapping[];
  track_id: string;
}

// Form data types for compatibility
export interface FormData {
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  timezone?: number;
  location?: string;
}

// Audio status for compatibility
export interface AudioStatus {
  isPlaying: boolean;
  isLoading: boolean;
  currentTime?: number;
  duration?: number;
  volume?: number;
  currentSession: any;
  error: string | null;
}

// Audio session type
export interface AudioSession {
  id: string;
  chartData: AstroChart;
  audioConfig: AudioConfig;
  status: 'generating' | 'ready' | 'error';
  createdAt: string;
  chartId?: string;
  configuration?: any;
  isPlaying?: boolean;
}