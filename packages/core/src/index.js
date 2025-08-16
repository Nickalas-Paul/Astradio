import { z } from 'zod';
import { SwissEph } from 'swisseph-wasm';
// Note: SeededRNG class removed as it's not currently used in the MVP
// Musical mapping functions - preserved from original
export function keyFromChart(chart) {
    // Use Sun's longitude to determine key
    const sun = chart.planets.find(p => p.name === 'Sun');
    if (!sun)
        return 'C';
    const keys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
    const keyIndex = Math.floor((sun.lon / 360) * 12);
    return keys[keyIndex % 12];
}
export function tempoFromMotion(chart, genre) {
    // Calculate mean planetary daily motion
    const speeds = chart.planets.map(p => Math.abs(p.speed));
    const meanSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    // Map to tempo ranges by genre
    const genreTempos = {
        ambient: [60, 90],
        techno: [120, 140],
        world: [80, 110],
        'hip-hop': [85, 95]
    };
    const [min, max] = genreTempos[genre] || [80, 120];
    return Math.max(min, Math.min(max, 60 + meanSpeed * 10));
}
export function scaleFromGenre(genre) {
    // Return scale degrees (0-11) for each genre
    const scales = {
        ambient: [0, 2, 4, 7, 9, 11], // Major pentatonic
        techno: [0, 2, 4, 5, 7, 9, 11], // Natural minor
        world: [0, 2, 4, 5, 7, 9, 10], // Dorian
        'hip-hop': [0, 2, 4, 7, 9] // Minor pentatonic
    };
    return scales[genre] || [0, 2, 4, 7, 9, 11];
}
export function aspectWeights(chart) {
    // Calculate rhythm density from aspect counts
    const aspectCounts = chart.aspects.reduce((acc, aspect) => {
        acc[aspect.type] = (acc[aspect.type] || 0) + 1;
        return acc;
    }, {});
    // Weight by aspect type
    const weights = {
        conj: 1.0,
        opp: 0.8,
        trine: 0.6,
        square: 0.9,
        sextile: 0.5
    };
    return Object.entries(aspectCounts).reduce((total, [type, count]) => {
        return total + (count * (weights[type] || 0.5));
    }, 0);
}
// Main mapping function - combines ephemeris data with music generation
export function mapChartToMusic(params) {
    // Convert ephemeris to chart format for compatibility
    const chart = {
        julianDay: Date.now() / 86400000 + 2440587.5, // Approximate Julian Day
        planets: params.ephemeris.map(eph => ({
            name: eph.body,
            lon: eph.longitude,
            latEcl: eph.latitude,
            speed: eph.speed
        })),
        aspects: [] // Simplified for MVP
    };
    const tempo = tempoFromMotion(chart, params.genre);
    const key = keyFromChart(chart);
    const scale = params.genre === 'ambient' ? 'major pentatonic' :
        params.genre === 'techno' ? 'natural minor' :
            params.genre === 'world' ? 'dorian' : 'minor pentatonic';
    // Generate rhythm patterns based on planetary positions
    const layers = params.ephemeris.slice(0, 4).map((planet, i) => ({
        instrument: ['pad', 'bass', 'lead', 'drums'][i] || 'pad',
        pattern: generateRhythmPattern(planet.longitude, planet.speed)
    }));
    return { tempo, key, scale, layers };
}
// Helper function to generate rhythm patterns
function generateRhythmPattern(longitude, speed) {
    const basePattern = '....x..x....x...'; // 16-step pattern
    const speedFactor = Math.abs(speed) / 2; // Normalize speed
    const density = Math.min(8, Math.max(2, Math.floor(speedFactor * 4))); // 2-8 hits
    // Create pattern based on longitude and speed
    const pattern = basePattern.split('');
    const positions = [];
    for (let i = 0; i < density; i++) {
        const pos = Math.floor((longitude / 360) * 16 + i * (16 / density)) % 16;
        positions.push(pos);
    }
    positions.forEach(pos => {
        pattern[Math.floor(pos)] = 'x';
    });
    return pattern.join('');
}
// Swiss Ephemeris wrapper - real implementation
export async function getCurrentEphemerisUTC() {
    try {
        // Initialize Swiss Ephemeris
        const swisseph = new SwissEph();
        await swisseph.init();
        // Get current UTC time
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = now.getUTCMonth() + 1; // 0-indexed to 1-indexed
        const day = now.getUTCDate();
        const hour = now.getUTCHours();
        const minute = now.getUTCMinutes();
        // Convert to Julian Day
        const jd = swisseph.dateToJulianDay(year, month, day, hour, minute, 0);
        // Planet constants (Swiss Ephemeris planet numbers)
        const planets = [
            { body: "Sun", id: 0 },
            { body: "Moon", id: 1 },
            { body: "Mercury", id: 2 },
            { body: "Venus", id: 3 },
            { body: "Mars", id: 4 },
            { body: "Jupiter", id: 5 },
            { body: "Saturn", id: 6 },
            { body: "Uranus", id: 7 },
            { body: "Neptune", id: 8 },
            { body: "Pluto", id: 9 }
        ];
        const ephemeris = [];
        for (const planet of planets) {
            try {
                // Calculate position
                const result = swisseph.calcPlanet(jd, planet.id);
                // Calculate speed by getting position 1 day later
                const jdNext = jd + 1;
                const resultNext = swisseph.calcPlanet(jdNext, planet.id);
                // Calculate daily motion (speed)
                let speed = resultNext.longitude - result.longitude;
                if (speed > 180)
                    speed -= 360; // Handle retrograde motion
                if (speed < -180)
                    speed += 360;
                ephemeris.push({
                    body: planet.body,
                    longitude: result.longitude,
                    latitude: result.latitude,
                    speed: speed
                });
            }
            catch (error) {
                console.warn(`Failed to calculate ${planet.body}:`, error);
                // Fallback to approximate values
                ephemeris.push({
                    body: planet.body,
                    longitude: 0,
                    latitude: 0,
                    speed: 0
                });
            }
        }
        return ephemeris;
    }
    catch (error) {
        console.error('Swiss Ephemeris initialization failed:', error);
        // Fallback to mock data if Swiss Ephemeris fails
        const mockEphemeris = [
            { body: "Sun", longitude: 143.2, latitude: 0, speed: 0.98 },
            { body: "Moon", longitude: 22.08, latitude: 0, speed: 13.2 },
            { body: "Mercury", longitude: 124.67, latitude: 0, speed: 1.2 },
            { body: "Venus", longitude: 106.15, latitude: 0, speed: 1.1 },
            { body: "Mars", longitude: 184.40, latitude: 0, speed: 0.5 },
            { body: "Jupiter", longitude: 104.42, latitude: 0, speed: 0.08 },
            { body: "Saturn", longitude: 1.11, latitude: 0, speed: 0.03 },
            { body: "Uranus", longitude: 61.24, latitude: 0, speed: 0.01 },
            { body: "Neptune", longitude: 1.77, latitude: 0, speed: 0.005 },
            { body: "Pluto", longitude: 302.14, latitude: 0, speed: 0.002 }
        ];
        return mockEphemeris;
    }
}
// Validation schemas
export const ChartRequestSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    lat: z.number().min(-90).max(90).optional(),
    lon: z.number().min(-180).max(180).optional(),
    tz: z.string().optional()
});
export const GenerateRequestSchema = z.object({
    genre: z.enum(["ambient", "techno", "world", "hip-hop"]).default("ambient"),
    customEphemeris: z.array(z.object({
        body: z.string(),
        longitude: z.number(),
        latitude: z.number(),
        speed: z.number()
    })).optional()
});
