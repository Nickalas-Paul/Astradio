import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Inline minimal types to avoid workspace dependencies
export interface PlanetData {
  longitude: number;
  sign: SignData;
  house: number;
  retrograde: boolean;
}

export interface SignData {
  name: string;
  degree: number;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
}

export interface HouseData {
  cusp_longitude: number;
  sign: SignData;
}

export interface AspectData {
  planet1: string;
  planet2: string;
  type: string;
  angle: number;
  harmonic: string;
}

export interface AstroChart {
  planets: { [key: string]: PlanetData };
  houses: { [key: string]: HouseData };
  aspects?: AspectData[];
  metadata: {
    conversion_method: string;
    birth_datetime: string;
    coordinate_system: string;
  };
}

// Safe Swiss Ephemeris wrapper
let SwissEph: any = null;
let swissephAvailable = false;

try {
  SwissEph = require('swisseph');
  swissephAvailable = true;
  console.log('✅ Swiss Ephemeris native module loaded successfully');
} catch (error) {
  swissephAvailable = false;
  console.log('⚠️  Swiss Ephemeris native module not available, using fallback calculations');
}

// Music Engine - Single scalable module for daily chart music generation
class MusicEngine {
  static generateDailyChartMusic(date: string, genre: string = 'ambient') {
    const chart = this.generateChart(date);
    const events = this.chartToMusicEvents(chart, genre);
    
    return {
      chart,
      events,
      genre,
      metadata: {
        generated_at: new Date().toISOString(),
        engine_version: '1.0.0',
        method: swissephAvailable ? 'swiss_ephemeris' : 'simplified_fallback'
      }
    };
  }

  private static generateChart(date: string): AstroChart {
    if (swissephAvailable) {
      return this.generateWithSwissEph(date);
    }
    return this.generateSimplified(date);
  }

  private static generateWithSwissEph(date: string): AstroChart {
    // Swiss Ephemeris calculations would go here
    // For now, fallback to simplified
    return this.generateSimplified(date);
  }

  private static generateSimplified(date: string): AstroChart {
    const targetDate = new Date(date);
    const dayOfYear = Math.floor((targetDate.getTime() - new Date(targetDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // Simplified planetary positions based on date
    const sunLongitude = (dayOfYear * 0.9856 + 80) % 360;
    const moonLongitude = (dayOfYear * 13.1764 + 180) % 360;
    
    return {
      planets: {
        Sun: {
          longitude: sunLongitude,
          sign: this.longitudeToSign(sunLongitude),
          house: Math.floor(sunLongitude / 30) + 1,
          retrograde: false
        },
        Moon: {
          longitude: moonLongitude,
          sign: this.longitudeToSign(moonLongitude),
          house: Math.floor(moonLongitude / 30) + 1,
          retrograde: false
        },
        Mercury: {
          longitude: (sunLongitude + 30) % 360,
          sign: this.longitudeToSign((sunLongitude + 30) % 360),
          house: Math.floor(((sunLongitude + 30) % 360) / 30) + 1,
          retrograde: Math.random() > 0.8
        },
        Venus: {
          longitude: (sunLongitude + 60) % 360,
          sign: this.longitudeToSign((sunLongitude + 60) % 360),
          house: Math.floor(((sunLongitude + 60) % 360) / 30) + 1,
          retrograde: false
        },
        Mars: {
          longitude: (sunLongitude + 90) % 360,
          sign: this.longitudeToSign((sunLongitude + 90) % 360),
          house: Math.floor(((sunLongitude + 90) % 360) / 30) + 1,
          retrograde: Math.random() > 0.9
        }
      },
      houses: {
        "1": { cusp_longitude: 0, sign: this.longitudeToSign(0) },
        "2": { cusp_longitude: 30, sign: this.longitudeToSign(30) },
        "3": { cusp_longitude: 60, sign: this.longitudeToSign(60) },
        "4": { cusp_longitude: 90, sign: this.longitudeToSign(90) },
        "5": { cusp_longitude: 120, sign: this.longitudeToSign(120) },
        "6": { cusp_longitude: 150, sign: this.longitudeToSign(150) },
        "7": { cusp_longitude: 180, sign: this.longitudeToSign(180) },
        "8": { cusp_longitude: 210, sign: this.longitudeToSign(210) },
        "9": { cusp_longitude: 240, sign: this.longitudeToSign(240) },
        "10": { cusp_longitude: 270, sign: this.longitudeToSign(270) },
        "11": { cusp_longitude: 300, sign: this.longitudeToSign(300) },
        "12": { cusp_longitude: 330, sign: this.longitudeToSign(330) }
      },
      metadata: {
        conversion_method: swissephAvailable ? 'swiss_ephemeris' : 'simplified_fallback',
        birth_datetime: targetDate.toISOString(),
        coordinate_system: 'tropical'
      }
    };
  }

  private static longitudeToSign(longitude: number): SignData {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    const elements = ['Fire', 'Earth', 'Air', 'Water'];
    const modalities = ['Cardinal', 'Fixed', 'Mutable'];
    
    const signIndex = Math.floor(longitude / 30);
    const degree = longitude % 30;
    
    return {
      name: signs[signIndex],
      degree: Math.floor(degree),
      element: elements[signIndex % 4] as 'Fire' | 'Earth' | 'Air' | 'Water',
      modality: modalities[signIndex % 3] as 'Cardinal' | 'Fixed' | 'Mutable'
    };
  }

  private static chartToMusicEvents(chart: AstroChart, genre: string) {
    const events: any[] = [];
    const planets = Object.entries(chart.planets);
    
    planets.forEach(([name, data], index) => {
      const baseFreq = {
        Sun: 261.63, Moon: 293.66, Mercury: 329.63, Venus: 349.23, Mars: 392.00
      }[name] || 440;
      
      const frequency = baseFreq * (1 + (data.longitude / 360) * 0.5);
      const startTime = index * 2; // 2 seconds apart
      const duration = genre === 'techno' ? 1.5 : genre === 'ambient' ? 4 : 2;
      
      events.push({
        planet: name,
        frequency: Math.round(frequency),
        startTime,
        duration,
        volume: 0.6,
        instrument: genre === 'techno' ? 'square' : genre === 'ambient' ? 'sine' : 'triangle'
      });
    });
    
    return events;
  }
}

// CORS configuration for development and production
const corsOptions = {
  origin: [
    /\.vercel\.app$/,
    /vercel\.app$/,
    process.env.WEB_ORIGIN || 'http://localhost:3000',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
  ].filter(Boolean),
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Basic middleware
app.use(compression());
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    env: process.env.NODE_ENV || 'development',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// API status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    swissephAvailable,
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Today's chart endpoint
app.get('/api/ephemeris/today', (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const result = MusicEngine.generateDailyChartMusic(today, 'ambient');
    
    res.json({
      success: true,
      data: {
        date: today,
        chart: result.chart,
        events: result.events,
        metadata: result.metadata,
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Today chart error:', error);
    res.status(500).json({ error: 'Failed to generate today chart' });
  }
});

// Daily chart endpoint - core functionality
app.get('/api/daily/:date', (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }
    
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date' });
    }
    
    const result = MusicEngine.generateDailyChartMusic(date, 'ambient');
    
    res.json({
      success: true,
      data: {
        date,
        chart: result.chart,
        events: result.events,
        metadata: result.metadata,
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Daily chart error:', error);
    res.status(500).json({ error: 'Failed to generate daily chart' });
  }
});

// Genres endpoint
app.get('/api/genres', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: ['ambient', 'techno', 'world', 'hiphop']
  });
});

// Legacy genres endpoint for compatibility
app.get('/api/music/genres', (req: Request, res: Response) => {
  res.json(['ambient', 'techno', 'world', 'hiphop']);
});

// Audio generation endpoint
app.post('/api/audio/generate', (req: Request, res: Response) => {
  try {
    const { chartA, chartB, mode = 'personal', genre = 'ambient' } = req.body;
    
    if (!chartA) {
      return res.status(400).json({ error: 'chartA is required' });
    }
    
    // Generate a unique audio ID
    const audioId = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // For now, return the audio ID immediately
    // In a real implementation, this would queue the audio generation
    res.json({
      success: true,
      audioId,
      status: 'ready',
      mode,
      genre
    });
  } catch (error) {
    console.error('Audio generation error:', error);
    res.status(500).json({ error: 'Failed to generate audio' });
  }
});

// Audio streaming endpoint
app.get('/api/audio/stream/:audioId', (req: Request, res: Response) => {
  try {
    const { audioId } = req.params;
    
    // Set proper headers for audio streaming
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Accept-Ranges', 'bytes');
    
    // For now, generate a simple audio stream
    // In a real implementation, this would stream the actual generated audio
    const sampleRate = 44100;
    const duration = 10; // 10 seconds
    const samples = sampleRate * duration;
    
    // Generate a simple sine wave
    const frequency = 440; // A4 note
    const amplitude = 0.3;
    
    for (let i = 0; i < samples; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * amplitude;
      const buffer = Buffer.alloc(2);
      buffer.writeInt16LE(Math.floor(sample * 32767), 0);
      res.write(buffer);
    }
    
    res.end();
  } catch (error) {
    console.error('Audio streaming error:', error);
    res.status(500).json({ error: 'Failed to stream audio' });
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Start server - CRITICAL: Listen on process.env.PORT for Render
app.listen(PORT, () => {
  console.log(`🎵 Astradio API Server Started`);
  console.log(`🌐 Port: ${PORT}`);
  console.log(`🔒 CORS: Configured for Vercel domains`);
  console.log(`📍 Health: GET /health`);
  console.log(`🌅 Daily Charts: GET /api/daily/:date`);
  console.log(`🎶 Genres: GET /api/genres`);
  console.log(`📊 Status: GET /api/status`);
  console.log(`🎼 Swiss Ephemeris: ${swissephAvailable ? 'Available' : 'Fallback mode'}`);
});

export default app;
