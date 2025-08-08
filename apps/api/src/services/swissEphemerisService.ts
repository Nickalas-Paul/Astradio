import { AstroChart, PlanetData, HouseData, AspectData, SignData } from '../types/index.js';


// Try to import Swiss Ephemeris, but don't fail if it's not available
let SwissEph: any = null;
let swissephAvailable = false;

try {
  SwissEph = require('swisseph');
  swissephAvailable = true;
  console.log('✅ Swiss Ephemeris native module loaded successfully');
} catch (error) {
  console.log('⚠️  Swiss Ephemeris native module not available, using fallback calculations');
  console.log('   To enable full Swiss Ephemeris functionality, install Visual Studio Build Tools');
}

class SwissEphemerisService {
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = swissephAvailable;
    
    if (this.isAvailable) {
      this.initializeSwissEph();
    } else {
      console.log('🔮 Using simplified astrological calculations (Swiss Ephemeris not available)');
    }
  }

  private initializeSwissEph() {
    try {
      // Initialize Swiss Ephemeris with data files
      const dataPath = process.env.SWISS_EPHEMERIS_DATA_PATH || './temp-swisseph';
      SwissEph.swe_set_ephe_path(dataPath);
      console.log('✅ Swiss Ephemeris initialized with data path:', dataPath);
    } catch (error) {
      console.error('❌ Failed to initialize Swiss Ephemeris:', error);
      this.isAvailable = false;
    }
  }

  // Calculate planetary positions using Swiss Ephemeris or fallback
  async calculatePlanetaryPositions(
    date: Date,
    latitude: number,
    longitude: number,
    timezone: number
  ): Promise<{ [key: string]: PlanetData }> {
    if (this.isAvailable) {
      return this.calculateWithSwissEph(date, latitude, longitude, timezone);
    } else {
      return this.calculateWithFallback(date, latitude, longitude, timezone);
    }
  }

  // Calculate house cusps using Swiss Ephemeris or fallback
  async calculateHouseCusps(
    date: Date,
    latitude: number,
    longitude: number,
    timezone: number
  ): Promise<{ [key: string]: HouseData }> {
    if (this.isAvailable) {
      return this.calculateHousesWithSwissEph(date, latitude, longitude, timezone);
    } else {
      return this.calculateHousesWithFallback(date, latitude, longitude, timezone);
    }
  }

  // Calculate aspects between planets
  calculateAspects(planets: { [key: string]: PlanetData }): AspectData[] {
    const aspects: AspectData[] = [];
    const planetNames = Object.keys(planets);
    
    for (let i = 0; i < planetNames.length; i++) {
      for (let j = i + 1; j < planetNames.length; j++) {
        const planet1Name = planetNames[i];
        const planet2Name = planetNames[j];
        const planet1 = planets[planet1Name];
        const planet2 = planets[planet2Name];
        
        if (planet1 && planet2) {
          const aspect = this.calculateAspect(planet1, planet2);
          if (aspect) {
            aspects.push({
              planet1: planet1Name,
              planet2: planet2Name,
              type: aspect.type,
              angle: aspect.angle,
              harmonic: aspect.harmonic
            });
          }
        }
      }
    }
    
    return aspects;
  }

  // Convert to AstroChart format
  convertToAstroChart(
    planets: { [key: string]: PlanetData },
    houses: { [key: string]: HouseData },
    aspects: AspectData[],
    birthData: any
  ): AstroChart {
    return {
      planets,
      houses,
      metadata: {
        conversion_method: this.isAvailable ? 'swiss_ephemeris' : 'simplified',
        ayanamsa_correction: 0,
        birth_datetime: birthData.date + 'T' + birthData.time,
        coordinate_system: 'tropical'
      }
    };
  }

  // Swiss Ephemeris calculation methods
  private calculateWithSwissEph(
    date: Date,
    latitude: number,
    longitude: number,
    timezone: number
  ): { [key: string]: PlanetData } {
    const planets: { [key: string]: PlanetData } = {};
    const julianDay = this.dateToJulianDay(date);
    
    // Calculate positions for major planets
    const planetIds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // Sun through Pluto
    const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    
    planetIds.forEach((planetId, index) => {
      try {
        const result = SwissEph.swe_calc_ut(julianDay, planetId, SwissEph.SEFLG_SWIEPH);
        const longitude = result.longitude;
        const sign = this.longitudeToSign(longitude);
        
        planets[planetNames[index]] = {
          longitude,
          sign,
          house: this.calculateHouse(longitude),
          retrograde: result.retrograde === 1
        };
      } catch (error) {
        console.error(`Failed to calculate ${planetNames[index]}:`, error);
      }
    });
    
    return planets;
  }

  private calculateHousesWithSwissEph(
    date: Date,
    latitude: number,
    longitude: number,
    timezone: number
  ): { [key: string]: HouseData } {
    const houses: { [key: string]: HouseData } = {};
    const julianDay = this.dateToJulianDay(date);
    
    try {
      const result = SwissEph.swe_houses(julianDay, latitude, longitude, 'P'); // Placidus system
      
      for (let i = 1; i <= 12; i++) {
        const cuspLongitude = result.cusps[i];
        const sign = this.longitudeToSign(cuspLongitude);
        
        houses[i.toString()] = {
          cusp_longitude: cuspLongitude,
          sign
        };
      }
    } catch (error) {
      console.error('Failed to calculate houses:', error);
    }
    
    return houses;
  }

  // Fallback calculation methods (simplified)
  private calculateWithFallback(
    date: Date,
    latitude: number,
    longitude: number,
    timezone: number
  ): { [key: string]: PlanetData } {
    const planets: { [key: string]: PlanetData } = {};
    
    // Simplified planetary positions based on date
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Basic planetary positions (simplified calculations)
    const sunLongitude = this.calculateSunPosition(year, month, day);
    const moonLongitude = this.calculateMoonPosition(year, month, day);
    
    planets['Sun'] = {
      longitude: sunLongitude,
      sign: this.longitudeToSign(sunLongitude),
      house: 1, // Simplified
      retrograde: false
    };
    
    planets['Moon'] = {
      longitude: moonLongitude,
      sign: this.longitudeToSign(moonLongitude),
      house: 1, // Simplified
      retrograde: false
    };
    
    // Add other planets with simplified positions
    const otherPlanets = [
      { name: 'Mercury', baseLongitude: sunLongitude + 30 },
      { name: 'Venus', baseLongitude: sunLongitude + 60 },
      { name: 'Mars', baseLongitude: sunLongitude + 90 },
      { name: 'Jupiter', baseLongitude: sunLongitude + 120 },
      { name: 'Saturn', baseLongitude: sunLongitude + 150 }
    ];
    
    otherPlanets.forEach(planet => {
      const longitude = (planet.baseLongitude + (year - 2000) * 0.5) % 360;
      planets[planet.name] = {
        longitude,
        sign: this.longitudeToSign(longitude),
        house: 1, // Simplified
        retrograde: false
      };
    });
    
    return planets;
  }

  private calculateHousesWithFallback(
    date: Date,
    latitude: number,
    longitude: number,
    timezone: number
  ): { [key: string]: HouseData } {
    const houses: { [key: string]: HouseData } = {};
    
    // Simplified house calculation (equal house system)
    for (let i = 1; i <= 12; i++) {
      const cuspLongitude = (i - 1) * 30; // 30 degrees per house
      houses[i.toString()] = {
        cusp_longitude: cuspLongitude,
        sign: this.longitudeToSign(cuspLongitude)
      };
    }
    
    return houses;
  }

  // Utility methods
  private dateToJulianDay(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    
    // Simplified Julian Day calculation
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    
    let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    
    // Add time component
    jd += (hour - 12) / 24 + minute / 1440;
    
    return jd;
  }

  private longitudeToSign(longitude: number): SignData {
    const signs = [
      { name: 'Aries', element: 'Fire' as const, modality: 'Cardinal' as const },
      { name: 'Taurus', element: 'Earth' as const, modality: 'Fixed' as const },
      { name: 'Gemini', element: 'Air' as const, modality: 'Mutable' as const },
      { name: 'Cancer', element: 'Water' as const, modality: 'Cardinal' as const },
      { name: 'Leo', element: 'Fire' as const, modality: 'Fixed' as const },
      { name: 'Virgo', element: 'Earth' as const, modality: 'Mutable' as const },
      { name: 'Libra', element: 'Air' as const, modality: 'Cardinal' as const },
      { name: 'Scorpio', element: 'Water' as const, modality: 'Fixed' as const },
      { name: 'Sagittarius', element: 'Fire' as const, modality: 'Mutable' as const },
      { name: 'Capricorn', element: 'Earth' as const, modality: 'Cardinal' as const },
      { name: 'Aquarius', element: 'Air' as const, modality: 'Fixed' as const },
      { name: 'Pisces', element: 'Water' as const, modality: 'Mutable' as const }
    ];
    
    const signIndex = Math.floor(longitude / 30);
    const degree = longitude % 30;
    
    return {
      name: signs[signIndex].name,
      degree: Math.floor(degree),
      element: signs[signIndex].element,
      modality: signs[signIndex].modality
    };
  }

  private calculateAspect(planet1: PlanetData, planet2: PlanetData): { type: string; angle: number; harmonic: string } | null {
    const orb = Math.abs(planet1.longitude - planet2.longitude);
    const normalizedOrb = orb > 180 ? 360 - orb : orb;
    
    // Define major aspects
    const aspects = [
      { name: 'conjunction', angle: 0, orb: 10, harmonic: '1' },
      { name: 'sextile', angle: 60, orb: 6, harmonic: '6' },
      { name: 'square', angle: 90, orb: 8, harmonic: '4' },
      { name: 'trine', angle: 120, orb: 8, harmonic: '3' },
      { name: 'opposition', angle: 180, orb: 10, harmonic: '2' }
    ];
    
    for (const aspect of aspects) {
      if (Math.abs(normalizedOrb - aspect.angle) <= aspect.orb) {
        return {
          type: aspect.name,
          angle: normalizedOrb,
          harmonic: aspect.harmonic
        };
      }
    }
    
    return null;
  }

  private calculateHouse(longitude: number): number {
    // Simplified house calculation
    return Math.floor(longitude / 30) + 1;
  }

  // Simplified planetary position calculations
  private calculateSunPosition(year: number, month: number, day: number): number {
    // Simplified solar position calculation
    const daysSince2000 = (year - 2000) * 365.25 + this.dayOfYear(month, day);
    return (daysSince2000 * 0.9856) % 360;
  }

  private calculateMoonPosition(year: number, month: number, day: number): number {
    // Simplified lunar position calculation
    const daysSince2000 = (year - 2000) * 365.25 + this.dayOfYear(month, day);
    return (daysSince2000 * 13.1764) % 360;
  }

  private dayOfYear(month: number, day: number): number {
    const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let dayOfYear = day;
    for (let i = 1; i < month; i++) {
      dayOfYear += daysInMonth[i];
    }
    return dayOfYear;
  }

  // Public method to check if Swiss Ephemeris is available
  isSwissEphAvailable(): boolean {
    return this.isAvailable;
  }
}

export default SwissEphemerisService; 