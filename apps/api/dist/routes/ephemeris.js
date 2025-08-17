"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ephemerisRouter = void 0;
const express_1 = require("express");
const swissEphemerisService_1 = __importDefault(require("../services/swissEphemerisService"));
const dayCache_1 = require("../utils/dayCache");
exports.ephemerisRouter = (0, express_1.Router)();
const eph = new swissEphemerisService_1.default();
const cache = new dayCache_1.DayCache(24 * 60 * 60 * 1000);
// prewarm once on boot
(async () => {
    try {
        const data = await generateChartData((0, dayCache_1.isoDay)());
        cache.set((0, dayCache_1.isoDay)(), data);
        console.log('⚡ prewarmed ephemeris cache');
    }
    catch { }
})();
// Helper function to generate chart data
async function generateChartData(date) {
    const targetDate = new Date(date);
    const location = {
        latitude: 51.4769, // Greenwich default
        longitude: 0.0005,
        timezone: 0
    };
    // Calculate planetary positions
    const planets = await eph.calculatePlanetaryPositions(targetDate, location.latitude, location.longitude, location.timezone);
    // Calculate house cusps
    const houses = await eph.calculateHouseCusps(targetDate, location.latitude, location.longitude, location.timezone);
    // Calculate aspects
    const aspects = eph.calculateAspects(planets);
    // Create astrological chart
    const chart = eph.convertToAstroChart(planets, houses, aspects, { date: targetDate.toISOString(), time: targetDate.toTimeString() });
    return { chart };
}
exports.ephemerisRouter.get('/today', async (_req, res) => {
    const start = Date.now();
    const today = (0, dayCache_1.isoDay)();
    const cached = cache.get(today);
    if (cached) {
        res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=60');
        res.setHeader('Server-Timing', `ephemeris;dur=${Date.now() - start};desc="cache-hit"`);
        return res.json(cached);
    }
    try {
        const data = await generateChartData(today);
        cache.set(today, data);
        res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=60');
        res.setHeader('Server-Timing', `ephemeris;dur=${Date.now() - start};desc="cold"`);
        res.json(data);
    }
    catch {
        res.status(500).json({ error: 'ephemeris_failed' });
    }
});
//# sourceMappingURL=ephemeris.js.map