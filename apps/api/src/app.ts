import express, { Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "same-site" }
}));

// Compression middleware
app.use(compression());

// CORS for Vercel
app.use(cors({
  origin: [/\.vercel\.app$/, /vercel\.app$/],
  credentials: false
}));

// Body parsing
app.use(express.json({ limit: "50kb" }));

// Logging
app.use(morgan(':method :url :status :response-time ms'));

// Health check
app.get('/health', (req: Request, res: Response) => {
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

// API routes
app.get('/api/ephemeris/today', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    res.json({
      success: true,
      data: {
        date: today.toISOString().split('T')[0],
        chart: { planets: {}, houses: {} },
        events: [],
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get ephemeris data' });
  }
});

app.get('/api/genres', (req: Request, res: Response) => {
  res.json({
    genres: [
      {
        id: 'ambient',
        name: 'Ambient',
        description: 'Ethereal, spacious soundscapes perfect for meditation',
        tempo_range: '60-80 BPM',
        characteristics: ['Reverb-heavy', 'Drone elements', 'Minimal percussion']
      },
      {
        id: 'techno',
        name: 'Techno',
        description: 'Rhythmic electronic music with driving beats',
        tempo_range: '120-140 BPM',
        characteristics: ['Four-on-the-floor', 'Synthesizers', 'Industrial sounds']
      },
      {
        id: 'world',
        name: 'World',
        description: 'Global music influences and traditional instruments',
        tempo_range: '80-120 BPM',
        characteristics: ['Ethnic instruments', 'Cultural rhythms', 'Organic sounds']
      },
      {
        id: 'hiphop',
        name: 'Hip Hop',
        description: 'Urban beats with rhythmic patterns',
        tempo_range: '80-95 BPM',
        characteristics: ['Bass-heavy', 'Sampling', 'Rhythmic vocals']
      }
    ]
  });
});

app.get('/api/status', (req: Request, res: Response) => {
  res.json({ 
    swissephAvailable: true, 
    status: 'operational',
    version: '1.0.0'
  });
});

// Daily chart endpoint
app.get('/api/daily/:date', (req: Request, res: Response) => {
  const { date } = req.params;
  
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
  }
  
  res.json({
    success: true,
    data: {
      date,
      chart: { planets: {}, houses: {} },
      events: [],
      generated_at: new Date().toISOString()
    }
  });
});

app.listen(PORT, () => {
  console.log(`🎵 Astradio API running on port ${PORT}`);
});

export default app;
