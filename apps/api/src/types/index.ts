// Core types for Astradio API
export interface BirthData {
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  timezone: number;
}

export interface SignData {
  name: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  degree: number;
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

export interface AspectData {
  planet1: string;
  planet2: string;
  type: string;
  angle: number;
  harmonic: string;
}

export interface AstroChart {
  metadata: {
    conversion_method: string;
    ayanamsa_correction: number;
    birth_datetime: string;
    coordinate_system: 'tropical' | 'sidereal';
  };
  planets: Record<string, PlanetData>;
  houses: Record<string, HouseData>;
  aspects?: AspectData[];
}

export interface AudioSession {
  id: string;
  chartId: string;
  configuration: any;
  isPlaying: boolean;
  startTime: number;
}

export interface AudioConfiguration {
  mode?: string;
  duration?: number;
  tempo?: number;
  genre?: string;
}

export interface MelodicAudioSession extends AudioSession {
  phrases: any[];
  scale: string[];
  key: string;
  tempo: number;
  timeSignature: string;
}

export type GenreType = 'ambient' | 'electronic' | 'classical' | 'jazz' | 'rock' | 'folk' | 'hip-hop' | 'country' | 'reggae' | 'blues' | 'pop' | 'metal' | 'punk' | 'indie' | 'lo-fi' | 'synthwave' | 'chillwave' | 'downtempo' | 'world' | 'experimental';

export type MoodType = 'energetic' | 'calm' | 'melancholic' | 'uplifting' | 'mysterious' | 'romantic' | 'aggressive' | 'peaceful' | 'nostalgic' | 'futuristic' | 'organic' | 'mechanical' | 'spiritual' | 'grounded' | 'ethereal' | 'dramatic' | 'playful' | 'serious' | 'contemplative' | 'celebratory'; 