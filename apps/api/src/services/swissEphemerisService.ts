import { AstroChart, PlanetData, HouseData, AspectData } from '../types';

// Swiss Ephemeris WebAssembly integration
let SwissEph: any = null;

// Declare window for Node.js environment
declare const window: any;

try {
  // Only try to require in Node.js environment
  if (typeof window === 'undefined') {
    SwissEph = require('swisseph-wasm');
  }
} catch (error) {
  console.warn('Swiss Ephemeris WebAssembly not available, using fallback calculations');
  // Fallback to basic calculations
}

export interface SwissEphemerisPlanet {
  name: string;
  longitude: number;
  latitude: number;
  distance: number;
  speed: number;
  sign: string;
  house: number;
  retrograde: boolean;
}

export interface SwissEphemerisHouse {
  house: number;
  cusp_longitude: number;
  sign: string;
}

export interface SwissEphemerisAspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  angle: number;
  orb: number;
  harmonic: string;
}

export class SwissEphemerisService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (SwissEph) {
        await SwissEph.init();
        console.log('✅ Swiss Ephemeris WebAssembly initialized');
      } else {
        console.log('⚠️ Using fallback Swiss Ephemeris calculations');
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize Swiss Ephemeris:', error);
      throw error;
    }
  }

  /**
   * Calculate planetary positions using Swiss Ephemeris
   */
  async calculatePlanetaryPositions(
    date: Date,
    latitude: number,
    longitude: number,
    timezone: number
  ): Promise<SwissEphemerisPlanet[]> {
    await this.initialize();

    const julianDay = this.dateToJulianDay(date);
    const planets: SwissEphemerisPlanet[] = [];

    // Traditional planets
    const planetList = [
      { name: 'Sun', id: 0 },
      { name: 'Moon', id: 1 },
      { name: 'Mercury', id: 2 },
      { name: 'Venus', id: 3 },
      { name: 'Mars', id: 4 },
      { name: 'Jupiter', id: 5 },
      { name: 'Saturn', id: 6 },
      { name: 'Uranus', id: 7 },
      { name: 'Neptune', id: 8 },
      { name: 'Pluto', id: 9 }
    ];

    for (const planet of planetList) {
      try {
        const position = await this.calculatePlanetPosition(julianDay, planet.id);
        const sign = this.longitudeToSign(position.longitude);
        const house = this.calculateHouse(position.longitude, latitude, longitude, julianDay);
        
        planets.push({
          name: planet.name,
          longitude: position.longitude,
          latitude: position.latitude,
          distance: position.distance,
          speed: position.speed,
          sign,
          house,
          retrograde: position.speed < 0
        });
      } catch (error) {
        console.warn(`Failed to calculate ${planet.name}:`, error);
      }
    }

    return planets;
  }

  /**
   * Calculate house cusps using Swiss Ephemeris
   */
  async calculateHouseCusps(
    date: Date,
    latitude: number,
    longitude: number,
    timezone: number,
    houseSystem: 'P' | 'K' | 'R' | 'C' | 'U' | 'E' | 'T' | 'B' | 'M' | 'W' | 'A' | 'V' | 'L' | 'J' | 'O' | 'Q' | 'X' | 'Y' | 'Z' = 'P'
  ): Promise<SwissEphemerisHouse[]> {
    await this.initialize();

    const julianDay = this.dateToJulianDay(date);
    const houses: SwissEphemerisHouse[] = [];

    try {
      if (SwissEph) {
        // Use Swiss Ephemeris WebAssembly for precise calculations
        const houseData = await SwissEph.houses(julianDay, latitude, longitude, houseSystem);
        
        for (let i = 1; i <= 12; i++) {
          const cuspLongitude = houseData.cusps[i];
          const sign = this.longitudeToSign(cuspLongitude);
          
          houses.push({
            house: i,
            cusp_longitude: cuspLongitude,
            sign
          });
        }
      } else {
        // Fallback calculation using basic astronomical formulas
        const houses = this.fallbackHouseCalculation(julianDay, latitude, longitude);
        return houses;
      }
    } catch (error) {
      console.warn('Failed to calculate houses with Swiss Ephemeris, using fallback:', error);
      return this.fallbackHouseCalculation(julianDay, latitude, longitude);
    }

    return houses;
  }

  /**
   * Calculate aspects between planets
   */
  calculateAspects(planets: SwissEphemerisPlanet[]): SwissEphemerisAspect[] {
    const aspects: SwissEphemerisAspect[] = [];
    const aspectOrbs = {
      conjunction: 10,
      sextile: 6,
      square: 8,
      trine: 8,
      opposition: 10
    };

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];
        
        const angle = Math.abs(planet1.longitude - planet2.longitude);
        const normalizedAngle = angle > 180 ? 360 - angle : angle;

        // Check for major aspects
        if (normalizedAngle <= aspectOrbs.conjunction) {
          aspects.push({
            planet1: planet1.name,
            planet2: planet2.name,
            type: 'conjunction',
            angle: normalizedAngle,
            orb: aspectOrbs.conjunction - normalizedAngle,
            harmonic: '1'
          });
        } else if (Math.abs(normalizedAngle - 60) <= aspectOrbs.sextile) {
          aspects.push({
            planet1: planet1.name,
            planet2: planet2.name,
            type: 'sextile',
            angle: normalizedAngle,
            orb: Math.abs(normalizedAngle - 60),
            harmonic: '6'
          });
        } else if (Math.abs(normalizedAngle - 90) <= aspectOrbs.square) {
          aspects.push({
            planet1: planet1.name,
            planet2: planet2.name,
            type: 'square',
            angle: normalizedAngle,
            orb: Math.abs(normalizedAngle - 90),
            harmonic: '4'
          });
        } else if (Math.abs(normalizedAngle - 120) <= aspectOrbs.trine) {
          aspects.push({
            planet1: planet1.name,
            planet2: planet2.name,
            type: 'trine',
            angle: normalizedAngle,
            orb: Math.abs(normalizedAngle - 120),
            harmonic: '3'
          });
        } else if (Math.abs(normalizedAngle - 180) <= aspectOrbs.opposition) {
          aspects.push({
            planet1: planet1.name,
            planet2: planet2.name,
            type: 'opposition',
            angle: normalizedAngle,
            orb: Math.abs(normalizedAngle - 180),
            harmonic: '2'
          });
        }
      }
    }

    return aspects;
  }

  /**
   * Convert Swiss Ephemeris data to AstroChart format
   */
  convertToAstroChart(
    planets: SwissEphemerisPlanet[],
    houses: SwissEphemerisHouse[],
    aspects: SwissEphemerisAspect[],
    birthData: any
  ): AstroChart {
    const chartPlanets: Record<string, PlanetData> = {};
    const chartHouses: Record<string, HouseData> = {};

    // Convert planets
    for (const planet of planets) {
      chartPlanets[planet.name] = {
        longitude: planet.longitude,
        sign: {
          name: planet.sign,
          element: this.signToElement(planet.sign),
          modality: this.signToModality(planet.sign),
          degree: planet.longitude % 30
        },
        house: planet.house,
        retrograde: planet.retrograde
      };
    }

    // Convert houses
    for (const house of houses) {
      chartHouses[house.house.toString()] = {
        cusp_longitude: house.cusp_longitude,
        sign: {
          name: house.sign,
          element: this.signToElement(house.sign),
          modality: this.signToModality(house.sign),
          degree: house.cusp_longitude % 30
        }
      };
    }

    // Convert aspects
    const chartAspects: AspectData[] = aspects.map(aspect => ({
      planet1: aspect.planet1,
      planet2: aspect.planet2,
      type: aspect.type,
      angle: aspect.angle,
      harmonic: aspect.harmonic
    }));

    return {
      metadata: {
        conversion_method: "swiss_ephemeris",
        ayanamsa_correction: 0,
        birth_datetime: birthData.date,
        coordinate_system: "tropical"
      },
      planets: chartPlanets,
      houses: chartHouses
    };
  }

  /**
   * Calculate transit positions for current date
   */
  async calculateTransits(
    natalDate: Date,
    transitDate: Date,
    latitude: number,
    longitude: number,
    timezone: number
  ): Promise<SwissEphemerisPlanet[]> {
    return await this.calculatePlanetaryPositions(transitDate, latitude, longitude, timezone);
  }

  // Private helper methods

  private async calculatePlanetPosition(julianDay: number, planetId: number): Promise<any> {
    if (SwissEph) {
      try {
        const position = await SwissEph.planet(julianDay, planetId);
        return {
          longitude: position.longitude,
          latitude: position.latitude,
          distance: position.distance,
          speed: position.speed
        };
      } catch (error) {
        console.warn('Swiss Ephemeris calculation failed, using fallback');
        return this.fallbackPlanetCalculation(julianDay, planetId);
      }
    } else {
      return this.fallbackPlanetCalculation(julianDay, planetId);
    }
  }

  private fallbackPlanetCalculation(julianDay: number, planetId: number): any {
    // Basic astronomical calculations as fallback
    const time = (julianDay - 2451545.0) / 36525.0;
    
    // Simplified planetary positions (not as precise as Swiss Ephemeris)
    const positions = {
      0: { longitude: (280.46646 + 36000.76983 * time) % 360, latitude: 0, distance: 1, speed: 1 }, // Sun
      1: { longitude: (218.3165 + 481267.8813 * time) % 360, latitude: 0, distance: 384400, speed: 13.2 }, // Moon
      2: { longitude: (252.2509 + 149472.6742 * time) % 360, latitude: 0, distance: 0.387, speed: 1.6 }, // Mercury
      3: { longitude: (181.9798 + 58517.8153 * time) % 360, latitude: 0, distance: 0.723, speed: 1.2 }, // Venus
      4: { longitude: (355.4333 + 19141.6964 * time) % 360, latitude: 0, distance: 1.524, speed: 0.88 }, // Mars
      5: { longitude: (34.3514 + 3034.9057 * time) % 360, latitude: 0, distance: 5.203, speed: 0.44 }, // Jupiter
      6: { longitude: (50.0774 + 1222.1138 * time) % 360, latitude: 0, distance: 9.537, speed: 0.32 }, // Saturn
      7: { longitude: (314.0550 + 428.4668 * time) % 360, latitude: 0, distance: 19.191, speed: 0.21 }, // Uranus
      8: { longitude: (304.3487 + 218.4862 * time) % 360, latitude: 0, distance: 30.069, speed: 0.17 }, // Neptune
      9: { longitude: (238.9293 + 145.2078 * time) % 360, latitude: 0, distance: 39.482, speed: 0.15 } // Pluto
    };

    return positions[planetId as keyof typeof positions] || { longitude: 0, latitude: 0, distance: 1, speed: 1 };
  }

  private fallbackHouseCalculation(julianDay: number, latitude: number, longitude: number): SwissEphemerisHouse[] {
    // Basic house calculation using Placidus system
    const houses: SwissEphemerisHouse[] = [];
    const time = (julianDay - 2451545.0) / 36525.0;
    
    // Simplified house calculation
    for (let i = 1; i <= 12; i++) {
      const cuspLongitude = (i - 1) * 30; // Simplified equal house system
      const sign = this.longitudeToSign(cuspLongitude);
      
      houses.push({
        house: i,
        cusp_longitude: cuspLongitude,
        sign
      });
    }

    return houses;
  }

  private dateToJulianDay(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    // Convert to Julian Day Number
    let jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) + Math.floor(275 * month / 9) + day + 1721013.5;
    jd += hour / 24 + minute / 1440 + second / 86400;

    return jd;
  }

  private longitudeToSign(longitude: number): string {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = Math.floor(longitude / 30);
    return signs[signIndex % 12];
  }

  private calculateHouse(planetLongitude: number, latitude: number, longitude: number, julianDay: number): number {
    // Simplified house calculation
    const houseSize = 30; // Equal house system
    return Math.floor(planetLongitude / houseSize) + 1;
  }

  private signToElement(sign: string): 'Fire' | 'Earth' | 'Air' | 'Water' {
    const elementMap: Record<string, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
      'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
      'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
      'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
      'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
    };
    return elementMap[sign] || 'Fire';
  }

  private signToModality(sign: string): 'Cardinal' | 'Fixed' | 'Mutable' {
    const modalityMap: Record<string, 'Cardinal' | 'Fixed' | 'Mutable'> = {
      'Aries': 'Cardinal', 'Cancer': 'Cardinal', 'Libra': 'Cardinal', 'Capricorn': 'Cardinal',
      'Taurus': 'Fixed', 'Leo': 'Fixed', 'Scorpio': 'Fixed', 'Aquarius': 'Fixed',
      'Gemini': 'Mutable', 'Virgo': 'Mutable', 'Sagittarius': 'Mutable', 'Pisces': 'Mutable'
    };
    return modalityMap[sign] || 'Cardinal';
  }
}

export default SwissEphemerisService; 