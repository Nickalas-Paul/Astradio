import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Pool } from 'pg';
import { ChartController } from './controllers/chartController';
import { TrackController } from './controllers/trackController';
import { TrackService } from './services/trackService';
import { RateLimiter } from './middleware/rateLimiter';
import { buildSecureAPIUrl, clientRateLimiter } from './lib/security';
import { melodicGenerator } from '@astradio/audio-mappings';
import { AstroChart } from './types';
import * as fs from 'fs';
import * as path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize services
const trackService = new TrackService(pool);
const rateLimiter = new RateLimiter(trackService);

// Initialize controllers
const chartController = new ChartController();
const trackController = new TrackController(trackService, rateLimiter);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Chart generation endpoint with rate limiting
app.post('/api/charts/generate', 
  rateLimiter.audioGenerationLimiter.bind(rateLimiter),
  async (req, res) => {
    try {
      const { birth_data, mode, genre } = req.body;
      
      if (!birth_data) {
        return res.status(400).json({
          success: false,
          error: 'Birth data is required'
        });
      }

      const chart = await chartController.generateChart(birth_data);
      
      if (!chart) {
        return res.status(500).json({
          success: false,
          error: 'Failed to generate chart'
        });
      }

      // Generate audio
      const audioData = await melodicGenerator.generateAudio(chart, genre || 'ambient');
      
      if (!audioData) {
        return res.status(500).json({
          success: false,
          error: 'Failed to generate audio'
        });
      }

      // Save audio file
      const fileName = `chart_${Date.now()}.wav`;
      const filePath = path.join(process.cwd(), 'public', 'audio', fileName);
      
      // Ensure audio directory exists
      const audioDir = path.dirname(filePath);
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }

      fs.writeFileSync(filePath, audioData);

      // Store track metadata
      const trackId = trackService.generateTrackId();
      const track = await trackService.createTrack({
        track_id: trackId,
        chart_id: `chart_${Date.now()}`,
        user_id: req.body.userId,
        url: `/audio/${fileName}`,
        genre: genre || 'ambient',
        duration: 30, // Default duration
        file_size: audioData.length,
        chart_data: chart,
        metadata: {
          mode,
          birth_data,
          generation_timestamp: new Date().toISOString()
        }
      });

      // Increment generation count
      await rateLimiter.incrementGenerationCount(req, res, () => {});

      res.json({
        success: true,
        data: {
          chart,
          audio: {
            url: `/audio/${fileName}`,
            track_id: trackId,
            duration: 30
          }
        }
      });
    } catch (error) {
      console.error('Error generating chart:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate chart and audio'
      });
    }
  }
);

// Daily chart endpoint
app.get('/api/daily/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    // Check if we have a cached daily track
    const existingTrack = await trackService.getDailyTrack(date);
    
    if (existingTrack) {
      return res.json({
        success: true,
        data: {
          chart: existingTrack.chart_data,
          audio: {
            url: existingTrack.url,
            track_id: existingTrack.track_id,
            duration: existingTrack.duration
          }
        }
      });
    }

    // Generate new daily chart
    const chart = await chartController.generateDailyChart(date);
    
    if (!chart) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate daily chart'
      });
    }

    // Generate audio
    const audioData = await melodicGenerator.generateAudio(chart, 'ambient');
    
    if (!audioData) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate daily audio'
      });
    }

    // Save audio file
    const fileName = `daily_${date}.wav`;
    const filePath = path.join(process.cwd(), 'public', 'audio', fileName);
    
    // Ensure audio directory exists
    const audioDir = path.dirname(filePath);
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    fs.writeFileSync(filePath, audioData);

    // Store track metadata
    const trackId = trackService.generateTrackId();
    const track = await trackService.createTrack({
      track_id: trackId,
      chart_id: `daily_${date}`,
      url: `/audio/${fileName}`,
      genre: 'ambient',
      duration: 30,
      file_size: audioData.length,
      chart_data: chart,
      metadata: {
        mode: 'daily',
        date,
        generation_timestamp: new Date().toISOString()
      }
    });

    // Store as daily track
    await trackService.createDailyTrack(date, trackId, chart, 'ambient');

    res.json({
      success: true,
      data: {
        chart,
        audio: {
          url: `/audio/${fileName}`,
          track_id: trackId,
          duration: 30
        }
      }
    });
  } catch (error) {
    console.error('Error generating daily chart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate daily chart'
    });
  }
});

// Track management endpoints
app.get('/api/tracks/:trackId', 
  rateLimiter.trackPlayEvent.bind(rateLimiter),
  trackController.getTrack.bind(trackController)
);

app.get('/api/tracks/user/:userId', 
  rateLimiter.generalLimiter.bind(rateLimiter),
  trackController.getUserTracks.bind(trackController)
);

app.get('/api/tracks/recent', 
  rateLimiter.generalLimiter.bind(rateLimiter),
  trackController.getRecentTracks.bind(trackController)
);

app.get('/api/tracks/popular', 
  rateLimiter.generalLimiter.bind(rateLimiter),
  trackController.getPopularTracks.bind(trackController)
);

app.get('/api/tracks/:trackId/download', 
  rateLimiter.trackDownloadEvent.bind(rateLimiter),
  trackController.downloadTrack.bind(trackController)
);

// Admin endpoints
app.get('/api/admin/stats', trackController.getStorageStats.bind(trackController));
app.post('/api/admin/cleanup', trackController.cleanupOldTracks.bind(trackController));

// Rate limit info endpoint
app.get('/api/rate-limit', trackController.getRateLimitInfo.bind(trackController));

// Track metadata storage endpoint
app.post('/api/tracks/metadata', 
  rateLimiter.generalLimiter.bind(rateLimiter),
  trackController.storeTrackMetadata.bind(trackController)
);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 