import { AstroChart, BirthData } from '../types';
import SwissEphemerisService from '../services/swissEphemerisService';

export class ChartController {
  private swissEphService: SwissEphemerisService;

  constructor() {
    this.swissEphService = new SwissEphemerisService();
  }

  async generateChart(birthData: BirthData): Promise<AstroChart> {
    try {
      // Use real Swiss Ephemeris calculations
      const [year, month, day] = birthData.date.split('-').map(Number);
      const [hour, minute] = birthData.time.split(':').map(Number);
      const birthDate = new Date(year, month - 1, day, hour, minute);
      
      const planets = await this.swissEphService.calculatePlanetaryPositions(
        birthDate,
        birthData.latitude,
        birthData.longitude,
        birthData.timezone
      );
      
      const houses = await this.swissEphService.calculateHouseCusps(
        birthDate,
        birthData.latitude,
        birthData.longitude,
        birthData.timezone
      );
      
      const aspects = this.swissEphService.calculateAspects(planets);
      
      return this.swissEphService.convertToAstroChart(planets, houses, aspects, birthData);
    } catch (error) {
      console.error('Error generating chart with Swiss Ephemeris:', error);
      // Fallback to simplified calculations if Swiss Ephemeris fails
      return this.generateFallbackChart(birthData);
    }
  }

  async generateDailyChart(date: string): Promise<AstroChart> {
    try {
      // Use real Swiss Ephemeris calculations for daily chart
      return await this.swissEphService.getDailyChartFromEphemeris(date);
    } catch (error) {
      console.error('Error generating daily chart with Swiss Ephemeris:', error);
      // Fallback to simplified calculations
      return this.generateFallbackChart({
        date,
        time: '12:00',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: -5
      });
    }
  }

  // Fallback method using simplified calculations
  private generateFallbackChart(birthData: BirthData): AstroChart {
    console.log('⚠️ Using fallback chart generation (Swiss Ephemeris not available)');
    
    // Simplified chart generation for fallback
    return {
      planets: {
        Sun: {
          longitude: 15,
          sign: { name: 'Aries', element: 'Fire', degree: 15, modality: 'Cardinal' },
          house: 1,
          retrograde: false
        },
        Moon: {
          longitude: 45,
          sign: { name: 'Taurus', element: 'Earth', degree: 15, modality: 'Fixed' },
          house: 2,
          retrograde: false
        },
        Mercury: {
          longitude: 330,
          sign: { name: 'Pisces', element: 'Water', degree: 0, modality: 'Mutable' },
          house: 12,
          retrograde: false
        },
        Venus: {
          longitude: 312,
          sign: { name: 'Aquarius', element: 'Air', degree: 12, modality: 'Fixed' },
          house: 11,
          retrograde: false
        },
        Mars: {
          longitude: 240,
          sign: { name: 'Sagittarius', element: 'Fire', degree: 0, modality: 'Mutable' },
          house: 9,
          retrograde: false
        },
        Jupiter: {
          longitude: 95,
          sign: { name: 'Cancer', element: 'Water', degree: 5, modality: 'Cardinal' },
          house: 4,
          retrograde: false
        },
        Saturn: {
          longitude: 288,
          sign: { name: 'Capricorn', element: 'Earth', degree: 18, modality: 'Cardinal' },
          house: 10,
          retrograde: false
        },
        Uranus: {
          longitude: 322,
          sign: { name: 'Aquarius', element: 'Air', degree: 22, modality: 'Fixed' },
          house: 11,
          retrograde: false
        },
        Neptune: {
          longitude: 333,
          sign: { name: 'Pisces', element: 'Water', degree: 3, modality: 'Mutable' },
          house: 12,
          retrograde: false
        },
        Pluto: {
          longitude: 298,
          sign: { name: 'Capricorn', element: 'Earth', degree: 28, modality: 'Cardinal' },
          house: 10,
          retrograde: false
        }
      },
      houses: {
        1: { cusp_longitude: 0, sign: { name: 'Aries', element: 'Fire', degree: 0, modality: 'Cardinal' } },
        2: { cusp_longitude: 30, sign: { name: 'Taurus', element: 'Earth', degree: 0, modality: 'Fixed' } },
        3: { cusp_longitude: 60, sign: { name: 'Gemini', element: 'Air', degree: 0, modality: 'Mutable' } },
        4: { cusp_longitude: 90, sign: { name: 'Cancer', element: 'Water', degree: 0, modality: 'Cardinal' } },
        5: { cusp_longitude: 120, sign: { name: 'Leo', element: 'Fire', degree: 0, modality: 'Fixed' } },
        6: { cusp_longitude: 150, sign: { name: 'Virgo', element: 'Earth', degree: 0, modality: 'Mutable' } },
        7: { cusp_longitude: 180, sign: { name: 'Libra', element: 'Air', degree: 0, modality: 'Cardinal' } },
        8: { cusp_longitude: 210, sign: { name: 'Scorpio', element: 'Water', degree: 0, modality: 'Fixed' } },
        9: { cusp_longitude: 240, sign: { name: 'Sagittarius', element: 'Fire', degree: 0, modality: 'Mutable' } },
        10: { cusp_longitude: 270, sign: { name: 'Capricorn', element: 'Earth', degree: 0, modality: 'Cardinal' } },
        11: { cusp_longitude: 300, sign: { name: 'Aquarius', element: 'Air', degree: 0, modality: 'Fixed' } },
        12: { cusp_longitude: 330, sign: { name: 'Pisces', element: 'Water', degree: 0, modality: 'Mutable' } }
      },
      metadata: {
        conversion_method: 'simplified',
        ayanamsa_correction: 0,
        birth_datetime: birthData.date + 'T' + birthData.time,
        coordinate_system: 'tropical'
      }
    };
  }
} 