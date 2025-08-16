import { Router, Request, Response } from 'express';
import SwissEphemerisService from '../services/swissEphemerisService';
import { DayCache, isoDay } from '../utils/dayCache';

export const ephemerisRouter: Router = Router();
const eph = new SwissEphemerisService();
const cache = new DayCache<any>(24 * 60 * 60 * 1000);

// prewarm once on boot
(async () => {
  try {
    const data = await generateChartData(isoDay());
    cache.set(isoDay(), data);
    console.log('⚡ prewarmed ephemeris cache');
  } catch {}
})();

// Helper function to generate chart data
async function generateChartData(date: string) {
  const targetDate = new Date(date);
  const location = {
    latitude: 51.4769, // Greenwich default
    longitude: 0.0005,
    timezone: 0
  };

  // Calculate planetary positions
  const planets = await eph.calculatePlanetaryPositions(
    targetDate,
    location.latitude,
    location.longitude,
    location.timezone
  );

  // Calculate house cusps
  const houses = await eph.calculateHouseCusps(
    targetDate,
    location.latitude,
    location.longitude,
    location.timezone
  );

  // Calculate aspects
  const aspects = eph.calculateAspects(planets);

  // Create astrological chart
  const chart = eph.convertToAstroChart(
    planets,
    houses,
    aspects,
    { date: targetDate.toISOString(), time: targetDate.toTimeString() }
  );

  return { chart };
}

ephemerisRouter.get('/today', async (_req: Request, res: Response) => {
  const start = Date.now();
  const today = isoDay();
  const cached = cache.get(today);
  if (cached) {
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=60');
    res.setHeader('Server-Timing', `ephemeris;dur=${Date.now()-start};desc="cache-hit"`);
    return res.json(cached);
  }
  try {
    const data = await generateChartData(today);
    cache.set(today, data);
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=60');
    res.setHeader('Server-Timing', `ephemeris;dur=${Date.now()-start};desc="cold"`);
    res.json(data);
  } catch {
    res.status(500).json({ error: 'ephemeris_failed' });
  }
});
