import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';

// Import our core functionality
import SwissEphemerisService from './services/swissEphemerisService';
import AstroMusicService from './services/astroMusicService';
import DailyChartController from './controllers/dailyChartController';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    message: 'Astradio Core API - Minimal Version'
  });
});

// Initialize daily chart controller
const dailyChartController = new DailyChartController();

// Core daily chart endpoints
app.post('/api/daily', dailyChartController.generateDailyChart.bind(dailyChartController));
app.get('/api/daily/:date', dailyChartController.getChartForDate.bind(dailyChartController));
app.get('/api/genres', dailyChartController.getAvailableGenres.bind(dailyChartController));
app.get('/api/status', dailyChartController.getSwissEphStatus.bind(dailyChartController));

// Initialize services
const astroMusicService = new AstroMusicService();

// Music generation endpoints
app.get('/api/music/genres', (req, res) => {
  try {
    const genres = astroMusicService.getAvailableGenres();
    const genreInfo = genres.map(genre => ({
      id: genre,
      ...astroMusicService.getGenreInfo(genre)
    }));
    
    res.json({
      success: true,
      data: {
        genres: genreInfo
      }
    });
  } catch (error) {
    console.error('❌ Genres endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error fetching genres'
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
console.log('🚀 Starting Astradio Core API server...');
app.listen(PORT, () => {
  console.log(`🎵 ===== ASTRADIO CORE API STARTED =====`);
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌟 Swiss Ephemeris status: http://localhost:${PORT}/api/status`);
  console.log(`🎵 Daily chart: POST http://localhost:${PORT}/api/daily`);
  console.log(`📅 Chart by date: GET http://localhost:${PORT}/api/daily/:date`);
  console.log(`🎼 Available genres: GET http://localhost:${PORT}/api/genres`);
  console.log(`🎶 Music genres: GET http://localhost:${PORT}/api/music/genres`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Astradio Core API is ready!`);
});

export default app;
