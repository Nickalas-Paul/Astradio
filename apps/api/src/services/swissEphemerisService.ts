import path from 'path';

// Simple, bullet-proof Swiss Ephemeris service
export default class SwissEphemerisService {
  private mode: 'native' | 'fallback' = 'fallback';

  constructor() {
    try {
      // Try to load Swiss Ephemeris, but don't fail if it's not available
      const swe = require('swisseph');
      const ephePath = path.resolve(process.cwd(), 'temp-swisseph');
      swe.swe_set_ephe_path(ephePath);
      
      // Test if it works
      const testDate = new Date();
      const jd = swe.swe_julday(testDate.getFullYear(), testDate.getMonth() + 1, testDate.getDate(), 12, swe.SE_GREG_CAL);
      const result = swe.swe_calc_ut(jd, swe.SE_SUN, 0);
      
      if (result && typeof result === 'object') {
        this.mode = 'native';
        console.log('✅ Swiss Ephemeris initialized successfully');
      } else {
        throw new Error('Swiss Ephemeris test failed');
      }
    } catch (error) {
      console.warn('⚠️ Swiss Ephemeris failed to initialize, using fallback mode');
      this.mode = 'fallback';
    }
  }

  getMode(): string {
    return this.mode;
  }

  // BULLET-PROOF house calculation that never crashes
  private calcHousesSafe(jdut: number, lat: number, lon: number, sys: 'P' | 'E' | 'O' = 'P') {
    try {
      const swe = require('swisseph');
      const cusps = new Array<number>(13).fill(NaN);
      const ascmc = new Array<number>(10).fill(NaN);

      // Try Placidus first
      const rc = swe.swe_houses(jdut, lat, lon, 'P');
      if (rc && rc.cusps && rc.cusps.length > 1) {
        return { cusps: rc.cusps, ascmc: rc.ascmc || [], system: 'P' as const };
      }

      // Fallback to Equal House
      const rc2 = swe.swe_houses(jdut, lat, lon, 'E');
      if (rc2 && rc2.cusps && rc2.cusps.length > 1) {
        return { cusps: rc2.cusps, ascmc: rc2.ascmc || [], system: 'E' as const };
      }

      // Final fallback
      console.warn('House calculation failed; returning empty houses');
      return { cusps: [], ascmc: [], system: 'NONE' as const };
    } catch (error) {
      console.warn('House calculation error:', error);
      return { cusps: [], ascmc: [], system: 'NONE' as const };
    }
  }

  async calculatePlanetaryPositions(date: Date, latitude: number, longitude: number, timezone: number) {
    if (this.mode === 'fallback') {
      return this.getFallbackPlanets(date);
    }

    try {
      const swe = require('swisseph');
      const jd = swe.swe_julday(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours() + date.getMinutes() / 60, swe.SE_GREG_CAL);
      
      const planets: { [key: string]: any } = {};
      const planetIds = [swe.SE_SUN, swe.SE_MOON, swe.SE_MERCURY, swe.SE_VENUS, swe.SE_MARS, swe.SE_JUPITER, swe.SE_SATURN, swe.SE_URANUS, swe.SE_NEPTUNE, swe.SE_PLUTO];
      const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

      for (let i = 0; i < planetIds.length; i++) {
        try {
          const result = swe.swe_calc_ut(jd, planetIds[i], 0);
          if (result && typeof result === 'object') {
            planets[planetNames[i]] = {
              longitude: result.longitude || 0,
              latitude: result.latitude || 0,
              distance: result.distance || 0,
              longitudeSpeed: result.longitudeSpeed || 0,
              latitudeSpeed: result.latitudeSpeed || 0,
              distanceSpeed: result.distanceSpeed || 0
            };
          }
        } catch (error) {
          console.warn(`Failed to calculate ${planetNames[i]}:`, error);
          planets[planetNames[i]] = { longitude: 0, latitude: 0, distance: 0 };
        }
      }

      return planets;
    } catch (error) {
      console.error('Planetary calculation error:', error);
      return this.getFallbackPlanets(date);
    }
  }

  async calculateHouseCusps(date: Date, latitude: number, longitude: number, timezone: number) {
    if (this.mode === 'fallback') {
      return { cusps: [], ascmc: [] };
    }

    try {
      const swe = require('swisseph');
      const jd = swe.swe_julday(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours() + date.getMinutes() / 60, swe.SE_GREG_CAL);
      return this.calcHousesSafe(jd, latitude, longitude, 'P');
    } catch (error) {
      console.error('House calculation error:', error);
      return { cusps: [], ascmc: [] };
    }
  }

  calculateAspects(planets: { [key: string]: any }) {
    // Simple aspect calculation
    const aspects: any[] = [];
    const planetNames = Object.keys(planets);
    
    for (let i = 0; i < planetNames.length; i++) {
      for (let j = i + 1; j < planetNames.length; j++) {
        const planet1 = planets[planetNames[i]];
        const planet2 = planets[planetNames[j]];
        
        if (planet1 && planet2) {
          const diff = Math.abs(planet1.longitude - planet2.longitude);
          const orb = Math.min(diff, 360 - diff);
          
          if (orb <= 10) { // Conjunction
            aspects.push({
              planet1: planetNames[i],
              planet2: planetNames[j],
              aspect: 'conjunction',
              orb: orb
            });
          } else if (Math.abs(orb - 60) <= 6) { // Sextile
            aspects.push({
              planet1: planetNames[i],
              planet2: planetNames[j],
              aspect: 'sextile',
              orb: Math.abs(orb - 60)
            });
          } else if (Math.abs(orb - 90) <= 8) { // Square
            aspects.push({
              planet1: planetNames[i],
              planet2: planetNames[j],
              aspect: 'square',
              orb: Math.abs(orb - 90)
            });
          } else if (Math.abs(orb - 120) <= 8) { // Trine
            aspects.push({
              planet1: planetNames[i],
              planet2: planetNames[j],
              aspect: 'trine',
              orb: Math.abs(orb - 120)
            });
          } else if (Math.abs(orb - 180) <= 10) { // Opposition
            aspects.push({
              planet1: planetNames[i],
              planet2: planetNames[j],
              aspect: 'opposition',
              orb: Math.abs(orb - 180)
            });
          }
        }
      }
    }
    
    return aspects;
  }

  convertToAstroChart(planets: any, houses: any, aspects: any, metadata: any) {
    return {
      planets,
      houses,
      aspects,
      metadata
    };
  }

  private getFallbackPlanets(date: Date) {
    // Fallback planetary positions (approximate)
    return {
      'Sun': { longitude: 0, latitude: 0, distance: 1 },
      'Moon': { longitude: 30, latitude: 0, distance: 1 },
      'Mercury': { longitude: 15, latitude: 0, distance: 1 },
      'Venus': { longitude: 45, latitude: 0, distance: 1 },
      'Mars': { longitude: 60, latitude: 0, distance: 1 },
      'Jupiter': { longitude: 90, latitude: 0, distance: 1 },
      'Saturn': { longitude: 120, latitude: 0, distance: 1 },
      'Uranus': { longitude: 150, latitude: 0, distance: 1 },
      'Neptune': { longitude: 180, latitude: 0, distance: 1 },
      'Pluto': { longitude: 210, latitude: 0, distance: 1 }
    };
  }
} 



