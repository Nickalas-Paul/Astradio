import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3001;

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

app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swiss Ephemeris fallback calculations (inline to avoid workspace deps)
class SimplifiedAstro {
  static generateDailyChart(date: string) {
    const targetDate = new Date(date);
    const dayOfYear = Math.floor((targetDate.getTime() - new Date(targetDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // Simplified planetary positions based on date
    const sunLongitude = (dayOfYear * 0.9856 + 80) % 360; // Approximate sun position
    const moonLongitude = (dayOfYear * 13.1764 + 180) % 360; // Approximate moon position
    
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
        conversion_method: 'simplified_fallback',
        birth_datetime: targetDate.toISOString(),
        coordinate_system: 'tropical'
      }
    };
  }

  static longitudeToSign(longitude: number) {
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
      element: elements[signIndex % 4],
      modality: modalities[signIndex % 3]
    };
  }

  static generateMusicEvents(chart: any, genre: string = 'ambient') {
    const events: any[] = [];
    const planets = Object.entries(chart.planets);
    
    planets.forEach(([name, data]: [string, any], index) => {
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

// Health check
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    env: process.env.NODE_ENV || 'development',
    port: port,
    timestamp: new Date().toISOString()
  });
});

// Daily chart endpoint
app.get('/api/daily/:date', (req, res) => {
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
    
    const chart = SimplifiedAstro.generateDailyChart(date);
    
    res.json({
      success: true,
      data: {
        date,
        chart,
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Daily chart error:', error);
    res.status(500).json({ error: 'Failed to generate daily chart' });
  }
});

// Music genres endpoint
app.get('/api/music/genres', (_req, res) => {
  res.json(['ambient', 'techno', 'world', 'hiphop']);
});

// Music generation endpoint
app.post('/api/music/generate', (req, res) => {
  try {
    const { chart, genre = 'ambient' } = req.body;
    
    if (!chart) {
      return res.status(400).json({ error: 'Chart data required' });
    }
    
    const events = SimplifiedAstro.generateMusicEvents(chart, genre);
    
    res.json({
      success: true,
      data: {
        events,
        genre,
        duration: events.length * 2, // Total duration
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Music generation error:', error);
    res.status(500).json({ error: 'Failed to generate music' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server - IMPORTANT: bind to 0.0.0.0 for Render
app.listen(port, '0.0.0.0', () => {
  console.log(`🎵 Astradio API listening on http://0.0.0.0:${port}`);
  console.log(`📊 Health: http://0.0.0.0:${port}/health`);
  console.log(`🌟 Daily chart: http://0.0.0.0:${port}/api/daily/YYYY-MM-DD`);
  console.log(`🎼 Genres: http://0.0.0.0:${port}/api/music/genres`);
});

export default app;
