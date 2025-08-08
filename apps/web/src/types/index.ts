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

export interface AstroChart {
  planets: { [key: string]: PlanetData };
  houses: { [key: string]: any };
  aspects?: any[];
  metadata: {
    conversion_method: string;
    ayanamsa_correction: number;
    birth_datetime: string;
    coordinate_system: string;
  };
}

export interface AudioConfig {
  genre: 'ambient' | 'techno' | 'world' | 'hip-hop';
  tempo: number;
  key: string;
  scale: string[];
  duration: number;
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
}

// Audio status for compatibility
export interface AudioStatus {
  isPlaying: boolean;
  currentTime?: number;
  duration?: number;
  volume?: number;
  currentSession?: any;
}