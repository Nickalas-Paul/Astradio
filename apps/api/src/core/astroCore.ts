import axios from 'axios';
import { AstroChart, BirthData, PlanetData, HouseData, SignData } from '../types';

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

function toTropical(siderealDeg: number, ayanamsa: number): number {
  const tropical = siderealDeg + ayanamsa;
  return tropical >= 360 ? tropical - 360 : tropical;
}

function getSignData(degree: number): SignData {
  const index = Math.floor(degree / 30);
  return { ...signs[index], degree: degree % 30 };
}

export class AstroCore {
  async generateChart(birthData: BirthData): Promise<AstroChart> {
    try {
      const datetime = encodeURIComponent(`${birthData.date}T${birthData.time}:00${this.getOffsetString(birthData.timezone)}`);
      const coordinates = `${birthData.latitude},${birthData.longitude}`;

      // Auth token
      const tokenRes = await axios.post(
        process.env.ASTRO_TOKEN_URL!,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.ASTRO_CLIENT_ID!,
          client_secret: process.env.ASTRO_CLIENT_SECRET!
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      const token = tokenRes.data.access_token;

      // Planet positions
      const planetUrl = `https://api.prokerala.com/v2/astrology/planet-position?ayanamsa=1&coordinates=${coordinates}&datetime=${datetime}`;
      console.log('[ProKerala] Requesting:', planetUrl);
      console.log('[ProKerala] Token:', token.substring(0, 20) + '...');
      const planetRes = await axios.get(planetUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Use ayanamsa correction of 24.0 for Lahiri
      const ayanamsa = 24.0;

      const planets: Record<string, PlanetData> = {};
      for (const p of planetRes.data.data.planet_position) {
        // Skip Ascendant, Rahu, Ketu - only include main planets
        if (['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(p.name)) {
          const long = toTropical(p.longitude, ayanamsa);
          planets[p.name] = {
            longitude: long,
            retrograde: p.is_retrograde,
            house: p.position || 0,
            sign: getSignData(long)
          };
        }
      }

      // For houses, we'll use the Ascendant position and calculate house cusps
      const ascendant = planetRes.data.data.planet_position.find((p: any) => p.name === 'Ascendant');
      const houses: Record<string, HouseData> = {};
      if (ascendant) {
        const ascLong = toTropical(ascendant.longitude, ayanamsa);
        // Calculate house cusps (simplified - each house is 30 degrees)
        for (let i = 1; i <= 12; i++) {
          const houseLong = (ascLong + (i - 1) * 30) % 360;
          houses[i.toString()] = {
            cusp_longitude: houseLong,
            sign: getSignData(houseLong)
          };
        }
      }

      return {
        metadata: {
          conversion_method: 'sidereal+ayanamsa',
          ayanamsa_correction: ayanamsa,
          birth_datetime: datetime,
          coordinate_system: 'tropical'
        },
        planets,
        houses
      };
    } catch (error) {
      console.error('[ProKerala Error]', error instanceof Error ? error.message : 'Unknown error');
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('[ProKerala Response]', (error as any).response?.data);
      }
      console.warn('⚠️ Returning mock chart as fallback.');
      return this.getMockChart(birthData);
    }
  }

  private getOffsetString(tz: number): string {
    const sign = tz >= 0 ? '+' : '-';
    const hours = Math.abs(tz).toString().padStart(2, '0');
    return `${sign}${hours}:00`;
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
        ayanamsa_correction: 24,
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