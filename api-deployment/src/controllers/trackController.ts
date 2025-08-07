import { Request, Response } from 'express';
import { TrackService } from '../services/trackService';
import { RateLimiter } from '../middleware/rateLimiter';
import * as fs from 'fs';
import * as path from 'path';

export class TrackController {
  private trackService: TrackService;
  private rateLimiter: RateLimiter;

  constructor(trackService: TrackService, rateLimiter: RateLimiter) {
    this.trackService = trackService;
    this.rateLimiter = rateLimiter;
  }

  async getTrack(req: Request, res: Response) {
    try {
      const { trackId } = req.params;
      const track = await this.trackService.getTrackByTrackId(trackId);

      if (!track) {
        return res.status(404).json({
          success: false,
          error: 'Track not found'
        });
      }

      res.json({
        success: true,
        data: { track }
      });
    } catch (error) {
      console.error('Error getting track:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getUserTracks(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const tracks = await this.trackService.getTracksByUserId(userId, limit);

      res.json({
        success: true,
        data: { tracks }
      });
    } catch (error) {
      console.error('Error getting user tracks:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getRecentTracks(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const tracks = await this.trackService.getRecentTracks(limit);

      res.json({
        success: true,
        data: { tracks }
      });
    } catch (error) {
      console.error('Error getting recent tracks:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getPopularTracks(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const tracks = await this.trackService.getPopularTracks(limit);

      res.json({
        success: true,
        data: { tracks }
      });
    } catch (error) {
      console.error('Error getting popular tracks:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async downloadTrack(req: Request, res: Response) {
    try {
      const { trackId } = req.params;
      const track = await this.trackService.getTrackByTrackId(trackId);

      if (!track) {
        return res.status(404).json({
          success: false,
          error: 'Track not found'
        });
      }

      const filePath = path.join(process.cwd(), 'public', track.url);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: 'Audio file not found'
        });
      }

      // Set headers for file download
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Disposition', `attachment; filename="${trackId}.wav"`);
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error downloading track:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getStorageStats(req: Request, res: Response) {
    try {
      const stats = await this.trackService.getStorageStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting storage stats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async cleanupOldTracks(req: Request, res: Response) {
    try {
      const daysOld = parseInt(req.query.days as string) || 30;
      const deletedCount = await this.trackService.cleanupOldTracks(daysOld);
      
      res.json({
        success: true,
        data: { deletedCount }
      });
    } catch (error) {
      console.error('Error cleaning up old tracks:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getRateLimitInfo(req: Request, res: Response) {
    try {
      const sessionId = this.rateLimiter.getSessionId(req);
      const rateLimit = await this.trackService.checkRateLimit(sessionId);
      
      res.json({
        success: true,
        data: rateLimit
      });
    } catch (error) {
      console.error('Error getting rate limit info:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async storeTrackMetadata(req: Request, res: Response) {
    try {
      const {
        track_id,
        chart_id,
        user_id,
        url,
        genre,
        duration,
        file_size,
        chart_data,
        metadata
      } = req.body;

      if (!track_id || !chart_id || !url || !genre || !duration) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      const track = await this.trackService.createTrack({
        track_id,
        chart_id,
        user_id,
        url,
        genre,
        duration,
        file_size,
        chart_data,
        metadata
      });

      res.status(201).json({
        success: true,
        data: { track }
      });
    } catch (error) {
      console.error('Error storing track metadata:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
} 