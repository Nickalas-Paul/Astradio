// Core astrological types
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
  planets: { [key: string]: PlanetData };
  houses: { [key: string]: HouseData };
  metadata: {
    conversion_method: string;
    ayanamsa_correction: number;
    birth_datetime: string;
    coordinate_system: string;
  };
}

// Audio generation types
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

export interface MusicTrack {
  id: string;
  audioConfig: AudioConfig;
  planetMappings: PlanetAudioMapping[];
  generated_at: string;
  chart_data: AstroChart;
}

// API types
export interface DailyChartRequest {
  date?: string;
  location?: {
    latitude: number;
    longitude: number;
    timezone: number;
  };
}

export interface DailyChartResponse {
  chart: AstroChart;
  audio_config: AudioConfig;
  planet_mappings: PlanetAudioMapping[];
  track_id: string;
}

export interface GenreSettings {
  ambient: {
    tempo: number;
    instruments: string[];
    effects: string[];
  };
  techno: {
    tempo: number;
    instruments: string[];
    effects: string[];
  };
  world: {
    tempo: number;
    instruments: string[];
    effects: string[];
  };
  'hip-hop': {
    tempo: number;
    instruments: string[];
    effects: string[];
  };
}