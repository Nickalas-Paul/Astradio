export interface AstroChart {
  planets: {
    [key: string]: {
      sign: {
        name: string;
        element: string;
      };
      house: number;
      degree: number;
    };
  };
  houses: {
    [key: number]: {
      sign: {
        name: string;
        element: string;
      };
      degree: number;
    };
  };
  aspects: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
  }>;
}

export interface BirthData {
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  timezone: string;
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