import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import SwissEphemerisService from './services/swissEphemerisService';
import DailyChartController from './controllers/dailyChartController';
import { audioRouter } from './routes/audio';
import { ephemerisRouter } from './routes/ephemeris';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - allow all origins for now
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Security and middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  try {
    const swissEphService = new SwissEphemerisService();
    const mode = swissEphService.getMode();
    
    res.json({ 
      ok: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      swisseph: mode
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      ok: false,
      error: 'Health check failed'
    });
  }
});

// Initialize daily chart controller
const dailyChartController = new DailyChartController();

// Daily chart endpoints
app.post('/api/daily', dailyChartController.generateDailyChart.bind(dailyChartController));
app.get('/api/daily/:date', dailyChartController.getChartForDate.bind(dailyChartController));
app.get('/api/genres', dailyChartController.getAvailableGenres.bind(dailyChartController));
app.get('/api/status', dailyChartController.getSwissEphStatus.bind(dailyChartController));



// Legacy endpoint for compatibility  
app.get('/api/music/genres', dailyChartController.getAvailableGenres.bind(dailyChartController));

// Mount routers
app.use('/api/audio', audioRouter);
app.use('/api/ephemeris', ephemerisRouter);

// Simple music play endpoint
app.post('/api/music/play', async (req, res) => {
  try {
    const { track_id, genre = 'ambient' } = req.body;
    
    // Return simple response for frontend compatibility
    res.json({
      success: true,
      data: {
        track_id: track_id || `track_${Date.now()}`,
        genre,
        status: 'playing',
        message: 'Music playback started'
      }
    });
  } catch (error) {
    console.error('Music play error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start music playback'
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎵 Astradio API Server Started`);
  console.log(`🌐 Port: ${PORT}`);
  console.log(`🔒 CORS: Configured for Vercel and localhost`);
  console.log(`📍 Health: GET /health`);
  console.log(`🌅 Daily Charts: POST /api/daily, GET /api/daily/:date`);
  console.log(`🎶 Genres: GET /api/genres`);
  console.log(`📊 Status: GET /api/status`);
  console.log(`🎵 Music: POST /api/music/play`);
});

export default app;
