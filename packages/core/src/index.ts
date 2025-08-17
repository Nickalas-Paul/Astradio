// packages/core/src/index.ts
import { ephemeris } from "ephemeris";
import { z } from 'zod';

export type EphemerisPoint = {
  body: string;       // "Sun", "Moon", ...
  longitude: number;  // ecliptic longitude (deg)
  latitude: number;   // ecliptic latitude (deg)
  speed: number;      // longitudinal speed (deg/day)
};

export type ChartRequest = {
  date?: string; // ISO date/time in UTC (default: now)
  lat?: number;  // not used for basic positions (topocentric optional later)
  lon?: number;
  tz?: string;   // not used here (we compute in UTC)
};

export type NatalChartRequest = {
  birthDate: string; // ISO date/time in UTC
  birthLat?: number; // birth latitude
  birthLon?: number; // birth longitude
};

// Planets to compute (extend freely later)
const PLANETS: Array<{ name: string; id: string }> = [
  { name: "Sun",   id: "sun" },
  { name: "Moon",  id: "moon" },
  { name: "Mercury", id: "mercury" },
  { name: "Venus", id: "venus" },
  { name: "Mars",  id: "mars" },
  { name: "Jupiter", id: "jupiter" },
  { name: "Saturn",  id: "saturn" },
  { name: "Uranus",  id: "uranus" },
  { name: "Neptune", id: "neptune" },
  { name: "Pluto",   id: "pluto" }
];

export async function getCurrentEphemerisUTC(
  req?: ChartRequest
): Promise<EphemerisPoint[]> {
  const when = req?.date ? new Date(req.date) : new Date();
  
  const results = await Promise.all(
    PLANETS.map(
      (p) =>
        new Promise<EphemerisPoint>((resolve, reject) => {
          try {
            const result = ephemeris(when, p.id);
            if (!result) {
              return reject(new Error(`Failed to calculate ${p.name}`));
            }
            
            resolve({
              body: p.name,
              longitude: result.longitude || 0,
              latitude: result.latitude || 0,
              speed: result.speed || 0
            });
          } catch (error) {
            reject(new Error(`Failed to calculate ${p.name}: ${error}`));
          }
        })
    )
  );

  return results;
}

export async function getNatalChart(
  req: NatalChartRequest
): Promise<EphemerisPoint[]> {
  const birthDate = new Date(req.birthDate);
  
  const results = await Promise.all(
    PLANETS.map(
      (p) =>
        new Promise<EphemerisPoint>((resolve, reject) => {
          try {
            const result = ephemeris(birthDate, p.id);
            if (!result) {
              return reject(new Error(`Failed to calculate natal ${p.name}`));
            }
            
            resolve({
              body: p.name,
              longitude: result.longitude || 0,
              latitude: result.latitude || 0,
              speed: result.speed || 0
            });
          } catch (error) {
            reject(new Error(`Failed to calculate natal ${p.name}: ${error}`));
          }
        })
    )
  );

  return results;
}

// Map ephemeris → a simple, stable music spec the frontend can render.
// Keep this contract stable; version if you add fields.
export function mapChartToMusic(params: {
  ephemeris: EphemerisPoint[];
  genre: "ambient" | "techno" | "world" | "hiphop";
}) {
  const { ephemeris, genre } = params;

  // Enhanced astrological music generation using Swiss Ephemeris data
  
  // Tempo from Sun speed + Moon speed (bounded)
  const sun = ephemeris.find((e) => e.body === "Sun");
  const moon = ephemeris.find((e) => e.body === "Moon");
  const baseTempo = 90 + Math.round(((sun?.speed || 1) + (moon?.speed || 13)) * 0.8);
  const tempo = Math.min(140, Math.max(70, baseTempo));

  // Key from Jupiter longitude (quadrant mapping)
  const jupiter = ephemeris.find((e) => e.body === "Jupiter");
  const deg = jupiter?.longitude ?? 0;
  const KEYS = ["C", "G", "D", "A", "E", "B", "F#", "C#", "F", "Bb", "Eb", "Ab"];
  const key = `${KEYS[Math.floor(((deg % 360) / 30) | 0)]} ${genre === "techno" ? "minor" : "major"}`;

  // Scale based on Venus position and genre
  const venus = ephemeris.find((e) => e.body === "Venus");
  const venusDeg = venus?.longitude ?? 0;
  const venusSign = Math.floor((venusDeg % 360) / 30);
  
  let scale: string;
  if (genre === "ambient") {
    scale = "dorian";
  } else if (genre === "hiphop") {
    scale = "minor pentatonic";
  } else if (genre === "world") {
    scale = "aeolian";
  } else {
    // techno - use Mars influence
    const mars = ephemeris.find((e) => e.body === "Mars");
    const marsDeg = mars?.longitude ?? 0;
    scale = (marsDeg % 30) > 15 ? "phrygian" : "aeolian";
  }

  // Enhanced layers based on planetary aspects and positions
  const layers = generateLayers(ephemeris, genre);

  return { tempo, key, scale, layers };
}

function generateLayers(ephemeris: EphemerisPoint[], genre: string) {
  const sun = ephemeris.find((e) => e.body === "Sun");
  const moon = ephemeris.find((e) => e.body === "Moon");
  const mars = ephemeris.find((e) => e.body === "Mars");
  const venus = ephemeris.find((e) => e.body === "Venus");
  const jupiter = ephemeris.find((e) => e.body === "Jupiter");
  const saturn = ephemeris.find((e) => e.body === "Saturn");

  // Calculate planetary aspects for rhythm complexity
  const sunMoonAspect = Math.abs((sun?.longitude ?? 0) - (moon?.longitude ?? 0)) % 30;
  const marsVenusAspect = Math.abs((mars?.longitude ?? 0) - (venus?.longitude ?? 0)) % 30;
  
  const rhythmComplexity = sunMoonAspect < 5 ? "simple" : sunMoonAspect < 15 ? "medium" : "complex";
  const harmonyComplexity = marsVenusAspect < 5 ? "simple" : marsVenusAspect < 15 ? "medium" : "complex";

  if (genre === "techno") {
    return [
      { instrument: "kick", pattern: rhythmComplexity === "simple" ? "x...x...x...x..." : "x..x..x..x..x..x.." },
      { instrument: "hat", pattern: "..x...x...x...x." },
      { instrument: "bass", pattern: harmonyComplexity === "simple" ? "x..x..x...x..x.." : "x.x.x.x.x.x.x.x.x" },
      { instrument: "lead", pattern: "....x...x...x..." }
    ];
  } else if (genre === "hiphop") {
    return [
      { instrument: "drums", pattern: rhythmComplexity === "simple" ? "x...x...x..x...." : "x..x..x..x..x..x.." },
      { instrument: "pad", pattern: "....x..x....x..." },
      { instrument: "bass", pattern: harmonyComplexity === "simple" ? "x..x..x..x..x..x.." : "x.x.x.x.x.x.x.x.x" }
    ];
  } else if (genre === "world") {
    return [
      { instrument: "perc", pattern: rhythmComplexity === "simple" ? "x..x.x..x..x.x.." : "x.x.x.x.x.x.x.x.x" },
      { instrument: "strings", pattern: "....x...x...x..." },
      { instrument: "flute", pattern: harmonyComplexity === "simple" ? "....x..x....x..." : "....x.x.x....x.x" }
    ];
  } else {
    // ambient
    return [
      { instrument: "pad", pattern: "....x..x....x..." },
      { instrument: "keys", pattern: "........x......." },
      { instrument: "drone", pattern: "x..............." }
    ];
  }
}

// Zod schema for API validation
export const GenerateRequestSchema = z.object({
  genre: z.enum(["ambient", "techno", "world", "hiphop"]),
  customEphemeris: z.array(z.object({
    body: z.string(),
    longitude: z.number(),
    latitude: z.number(),
    speed: z.number()
  })).optional(),
  natalChart: z.object({
    birthDate: z.string(),
    birthLat: z.number().optional(),
    birthLon: z.number().optional()
  }).optional()
});
