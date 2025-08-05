import { AstroChart, BirthData, PlanetData, HouseData, SignData } from '../types';
import SwissEphemerisService from '../services/swissEphemerisService';

const signs: Array<{ name: string; element: 'Fire' | 'Earth' | 'Air' | 'Water'; modality: 'Cardinal' | 'Fixed' | 'Mutable' }> = [
  { name: 'Aries', element: 'Fire', modality: 'Cardinal' },
  { name: 'Taurus', element: 'Earth', modality: 'Fixed' },
  { name: 'Gemini', element: 'Air', modality: 'Mutable' },
  { name: 'Cancer', element: 'Water', modality: 'Cardinal' },
  { name: 'Leo', element: 'Fire', modality: 'Fixed' },
  { name: 'Virgo', element: 'Earth', modality: 'Mutable' },
  { name: 'Libra', element: 'Air', modality: 'Cardinal' },
  { name: 'Scorpio', element: 'Water', modality: 'Fixed' },
  { name: 'Sagittarius', element: 'Fire', modality: 'Mutable' },
  { name: 'Capricorn', element: 'Earth', modality: 'Cardinal' },
  { name: 'Aquarius', element: 'Air', modality: 'Fixed' },
  { name: 'Pisces', element: 'Water', modality: 'Mutable' }
];

function getSignData(degree: number): SignData {
  const index = Math.floor(degree / 30);
  return { ...signs[index], degree: degree % 30 };
}

export class AstroCore {
  private swissEphService: SwissEphemerisService;

  constructor() {
    this.swissEphService = new SwissEphemerisService();
  }

  async generateChart(birthData: BirthData): Promise<AstroChart> {
    try {
      console.log('[Swiss Ephemeris] Generating chart with Swiss Ephemeris');

      // Parse birth date and time
      const [year, month, day] = birthData.date.split('-').map(Number);
      const [hour, minute] = birthData.time.split(':').map(Number);
      const birthDate = new Date(year, month - 1, day, hour, minute);
      
      // Calculate planetary positions using Swiss Ephemeris
      const planets = await this.swissEphService.calculatePlanetaryPositions(
        birthDate,
        birthData.latitude,
        birthData.longitude,
        birthData.timezone
      );
      
      // Calculate house cusps
      const houses = await this.swissEphService.calculateHouseCusps(
        birthDate,
        birthData.latitude,
        birthData.longitude,
        birthData.timezone
      );
      
      // Calculate aspects
      const aspects = this.swissEphService.calculateAspects(planets);
      
      // Convert to AstroChart format
      const chart = this.swissEphService.convertToAstroChart(planets, houses, aspects, birthData);
      
      console.log('[Swiss Ephemeris] Chart generated successfully');
      return chart;
    } catch (error) {
      console.error('[Swiss Ephemeris Error]', error instanceof Error ? error.message : 'Unknown error');
      console.warn('⚠️ Returning mock chart as fallback.');
      return this.getMockChart(birthData);
    }
  }

  async generateDailyChart(date?: string): Promise<AstroChart> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.generateChart({
      date: targetDate,
      time: '12:00',
      latitude: 0,
      longitude: 0,
      timezone: 0
    });
  }

  private getMockChart(birthData: BirthData): AstroChart {
    return {
      metadata: {
        conversion_method: 'mock',
        ayanamsa_correction: 0,
        birth_datetime: `${birthData.date}T${birthData.time}:00`,
        coordinate_system: 'tropical'
      },
      planets: {
        Sun: { longitude: 120, sign: getSignData(120), house: 5, retrograde: false },
        Moon: { longitude: 30, sign: getSignData(30), house: 2, retrograde: false }
      },
      houses: {
        '1': { cusp_longitude: 0, sign: getSignData(0) },
        '2': { cusp_longitude: 30, sign: getSignData(30) }
      }
    };
  }
}

export const astroCore = new AstroCore(); 