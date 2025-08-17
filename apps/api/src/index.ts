import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import { randomUUID } from "crypto";
import * as Sentry from "@sentry/node";
import { 
  getCurrentEphemerisUTC, 
  getNatalChart,
  mapChartToMusic, 
  GenerateRequestSchema,
  type EphemerisPoint 
} from "@astradio/core";

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
  debug: false,
});

const app = express();
const PORT = process.env.PORT || 3001;
const ORIGIN = process.env.CORS_ORIGIN || "*";

// Ephemeris micro-cache (30s TTL)
const ephCache: { data?: EphemerisPoint[]; at?: number } = {};
const TTL = 30_000;

// Performance & security middleware
app.use(cors({ origin: ORIGIN }));
app.use(helmet({
  contentSecurityPolicy: false, // keep simple for now, add CSP after
  crossOriginResourcePolicy: { policy: "same-site" }
}));
app.use(express.json({ limit: "50kb" }));
app.use((_req, res, next) => { 
  res.setHeader("X-Response-Time-Target", "<100ms"); 
  next(); 
});

// Sentry error tracking will be added in error handlers

// Request ID tracking
app.use((req, _res, next) => { 
  (req as any).rid = randomUUID(); 
  next(); 
});

// Structured logging
app.use(morgan(':method :url :status :response-time ms'));

// Rate limiting and slowdown
const slow = slowDown({ windowMs: 60_000, delayAfter: 30, delayMs: 50 });
const limit = rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true });

// Health check endpoint - optimized for Render
app.get("/health", (_req, res) => {
  res.json({ 
    ok: true, 
    service: "astradio-api", 
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    swisseph: "native"
  });
});

// Get current ephemeris data with micro-cache - FIXED FORMAT
app.get("/api/ephemeris/today", async (_req, res) => {
  try {
    const now = Date.now();
    if (ephCache.data && ephCache.at && now - ephCache.at < TTL) {
      return res.set("Cache-Control", "public, max-age=15").json({ 
        ok: true,
        ephemeris: ephCache.data,
        timestamp: new Date().toISOString(),
        cached: true
      });
    }
    
    // Get fresh ephemeris data from Swiss Ephemeris
    const ephemeris = await getCurrentEphemerisUTC();
    ephCache.data = ephemeris; 
    ephCache.at = now;
    
    res.set("Cache-Control", "public, max-age=15").json({ 
      ok: true,
      ephemeris,
      timestamp: new Date().toISOString(),
      cached: false
    });
  } catch (e: unknown) {
    console.error('Ephemeris error:', e);
    res.status(503).json({ 
      ok: false,
      error: "ephemeris_unavailable",
      message: e instanceof Error ? e.message : "Unknown error"
    });
  }
});

// Get natal chart data
app.post("/api/ephemeris/natal", async (req, res) => {
  try {
    const { birthDate, birthLat, birthLon } = req.body;
    
    if (!birthDate) {
      return res.status(400).json({
        ok: false,
        error: "birth_date_required"
      });
    }
    
    const natalEphemeris = await getNatalChart({
      birthDate,
      birthLat,
      birthLon
    });
    
    res.json({
      ok: true,
      ephemeris: natalEphemeris,
      birthDate,
      birthLat,
      birthLon,
      timestamp: new Date().toISOString()
    });
  } catch (e: unknown) {
    console.error('Natal chart error:', e);
    res.status(503).json({
      ok: false,
      error: "natal_chart_unavailable",
      message: e instanceof Error ? e.message : "Unknown error"
    });
  }
});

// Generate music from ephemeris data (protected with slowdown + rate limit)
app.post("/api/audio/generate", slow, limit, async (req, res) => {
  try {
    const input = GenerateRequestSchema.parse(req.body);
    
    // Get current ephemeris data (use cached if available, otherwise fresh)
    const now = Date.now();
    let ephemeris: EphemerisPoint[];
    
    if (ephCache.data && ephCache.at && now - ephCache.at < TTL) {
      ephemeris = ephCache.data;
    } else {
      ephemeris = await getCurrentEphemerisUTC();
      ephCache.data = ephemeris;
      ephCache.at = now;
    }
    
    // Use custom ephemeris if provided, otherwise use current
    let finalEphemeris = input.customEphemeris ?? ephemeris;
    
    // If natal chart is provided, use that instead
    if (input.natalChart) {
      try {
        finalEphemeris = await getNatalChart(input.natalChart);
      } catch (e) {
        console.error('Natal chart generation failed, using current ephemeris:', e);
        // Fall back to current ephemeris if natal chart fails
      }
    }
    
    // Generate music based on astrological data
    const music = mapChartToMusic({ ephemeris: finalEphemeris, genre: input.genre });
    
    // Return stable JSON spec as requested
    res.json({ 
      ok: true, 
      music: {
        tempo: music.tempo,
        key: music.key,
        scale: music.scale,
        layers: music.layers
      },
      ephemeris: finalEphemeris, // Include ephemeris data used for generation
      specVersion: 1,
      timestamp: new Date().toISOString()
    });
  } catch (e: unknown) {
    console.error('Music generation error:', e);
    res.status(400).json({ 
      ok: false,
      error: e instanceof Error ? e.message : "bad_request" 
    });
  }
});

// Legacy compatibility endpoint (for backward compatibility)
app.get("/api/today", async (_req, res) => {
  try {
    const ephemeris = await getCurrentEphemerisUTC();
    const chart = {
      planets: ephemeris.reduce((acc: Record<string, unknown>, planet: EphemerisPoint) => {
        acc[planet.body] = { 
          longitude: planet.longitude, 
          latitude: planet.latitude,
          speed: planet.speed,
          sign: { name: getZodiacSign(planet.longitude) } 
        };
        return acc;
      }, {}),
      houses: {},
      aspects: [],
      metadata: {
        date: new Date().toISOString(),
        calculation_method: 'astradio-core'
      }
    };
    
    res.json({ chart });
  } catch (error) {
    console.error('Today endpoint error:', error);
    res.status(500).json({ error: 'Failed to get today\'s chart' });
  }
});

// Helper function to get zodiac sign from longitude
function getZodiacSign(longitude: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const signIndex = Math.floor(longitude / 30);
  return signs[signIndex % 12];
}

// Error handling middleware
app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  
  // Capture error in Sentry with request context
  Sentry.captureException(err, {
    tags: {
      rid: (req as any).rid,
      endpoint: req.path,
      method: req.method
    },
    extra: {
      url: req.url,
      headers: req.headers,
      body: req.body
    }
  });
  
  res.status(500).json({
    ok: false,
    error: 'Internal server error',
    message: err instanceof Error ? err.message : 'Unknown error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎵 Astradio API Server Started`);
  console.log(`🌐 Port: ${PORT}`);
  console.log(`🔒 CORS: Configured for ${ORIGIN}`);
  console.log(`📍 Health: GET /health`);
  console.log(`🌅 Ephemeris: GET /api/ephemeris/today`);
  console.log(`🌟 Natal Chart: POST /api/ephemeris/natal`);
  console.log(`🎵 Music: POST /api/audio/generate`);
  console.log(`📊 Legacy: GET /api/today`);
});

export { app };
