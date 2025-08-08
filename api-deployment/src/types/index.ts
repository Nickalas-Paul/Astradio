export interface SignData {
  name: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  degree: number;
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
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
  planets: {
    [key: string]: PlanetData;
  };
  houses: {
    [key: string]: HouseData;
  };
  metadata: {
    conversion_method: string;
    ayanamsa_correction: number;
    birth_datetime: string;
    coordinate_system: string;
  };
}

export interface BirthData {
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  timezone: number;
}

export interface AudioGenerationRequest {
  birthData: BirthData;
  genre?: string;
}

export interface AudioGenerationResponse {
  success: boolean;
  data?: {
    chart: AstroChart;
    audioUrl: string;
    track: any;
  };
  error?: string;
} 