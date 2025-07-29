// Core Astrological Types
export interface AstroChart {
  metadata: ChartMetadata;
  planets: Record<string, PlanetData>;
  houses: Record<string, HouseData>;
}

export interface ChartMetadata {
  conversion_method: string;
  ayanamsa_correction: number;
  birth_datetime: string;
  coordinate_system: 'tropical' | 'sidereal';
}

export interface PlanetData {
  longitude: number;
  sign: SignData;
  house: number;
  retrograde: boolean;
}

export interface HouseData {
  cusp_longitude: number;
  sign: SignData;
}

export interface SignData {
  name: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  degree: number;
}

// Birth Data Types
export interface BirthData {
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  timezone: number;
  location?: string;
}

// Audio Types
export interface AudioConfiguration {
  mode: 'sequential' | 'layered' | 'overlay' | 'sandbox' | 'preview';
  duration?: number;
  tempo?: number;
  key?: string;
  genre?: GenreType;
  mood?: MoodType;
}

// Genre System Types
export type GenreType = 
  | 'ambient' | 'folk' | 'jazz' | 'classical' | 'electronic' 
  | 'rock' | 'blues' | 'world' | 'techno' | 'chill';

export type MoodType = 
  | 'contemplative' | 'energetic' | 'melancholic' | 'uplifting' 
  | 'mysterious' | 'peaceful' | 'passionate' | 'grounded';

export interface GenreConfiguration {
  name: GenreType;
  instruments: {
    melodic: string[];
    rhythmic: string[];
    bass: string[];
    pad: string[];
  };
  tempo: {
    min: number;
    max: number;
    default: number;
  };
  scales: string[];
  visualStyle: {
    colors: string[];
    motionSpeed: number;
    opacity: number;
    filter: string;
  };
  narration: {
    tone: string;
    language: string;
    style: string;
  };
  textile: string;
}

export interface MoodConfiguration {
  name: MoodType;
  genreWeights: Partial<Record<GenreType, number>>;
  tempo: {
    min: number;
    max: number;
    default: number;
  };
  visualFilter: string;
  narrationTone: string;
}

export interface AudioSession {
  id: string;
  chartId: string;
  configuration: AudioConfiguration;
  isPlaying: boolean;
  currentHouse?: number;
  startTime?: number;
  duration?: number;
  genre?: GenreType;
  mood?: MoodType;
}

// Frontend-specific types
export interface AudioStatus {
  isPlaying: boolean;
  isLoading: boolean;
  currentSession: AudioSession | null;
  error: string | null;
}

export interface ChartState {
  chart: AstroChart | null;
  isLoading: boolean;
  error: string | null;
}

export interface FormData {
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  timezone: number;
  location?: string;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 