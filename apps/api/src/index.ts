import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { 
  getCurrentEphemerisUTC, 
  mapChartToMusic, 
  GenerateRequestSchema,
  type EphemerisPoint 
} from "@astradio/core";

const app = express();
const PORT = process.env.PORT || 3001;
const ORIGIN = process.env.CORS_ORIGIN || "*";

// Middleware
app.use(cors({ origin: ORIGIN }));
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false
  })
);

// Health check endpoint - optimized for Render
app.get("/health", (_req, res) => {
  res.json({ 
    ok: true, 
    service: "astradio-api", 
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Get current ephemeris data
app.get("/api/ephemeris/today", async (_req, res) => {
  try {
    const ephemeris = await getCurrentEphemerisUTC();
    res.json({ 
      ok: true,
      ephemeris,
      timestamp: new Date().toISOString()
    });
  } catch (e: unknown) {
    console.error('Ephemeris error:', e);
    res.status(503).json({ 
      ok: false,
      error: "ephemeris_unavailable"
    });
  }
});

// Generate music from ephemeris data
app.post("/api/audio/generate", async (req, res) => {
  try {
    const input = GenerateRequestSchema.parse(req.body);
    const ephemeris = input.customEphemeris ?? (await getCurrentEphemerisUTC());
    const music = mapChartToMusic({ ephemeris, genre: input.genre });
    
    // Return stable JSON spec as requested
    res.json({ 
      ok: true, 
      music: {
        tempo: music.tempo,
        key: music.key,
        scale: music.scale,
        layers: music.layers
      },
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

// Legacy compatibility endpoint
app.get("/api/today", async (_req, res) => {
  try {
    const ephemeris = await getCurrentEphemerisUTC();
    const chart = {
      planets: ephemeris.reduce((acc: Record<string, unknown>, planet: EphemerisPoint) => {
        acc[planet.body] = { 
          longitude: planet.longitude, 
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
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🎵 Astradio API Server Started`);
    console.log(`🌐 Port: ${PORT}`);
    console.log(`🔒 CORS: Configured for ${ORIGIN}`);
    console.log(`📍 Health: GET /health`);
    console.log(`🌅 Ephemeris: GET /api/ephemeris/today`);
    console.log(`🎵 Music: POST /api/audio/generate`);
    console.log(`📊 Legacy: GET /api/today`);
  });
}

export { app };
