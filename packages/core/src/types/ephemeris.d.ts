declare module 'ephemeris' {
  export interface EphemerisResult {
    longitude: number;
    latitude: number;
    speed: number;
    distance?: number;
    magnitude?: number;
  }

  export function ephemeris(date: Date, planet: string): EphemerisResult | null;
}
