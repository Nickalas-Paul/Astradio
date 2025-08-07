import { Request, Response } from 'express';
import { TrackService } from '../services/trackService';
import { RateLimiter } from '../middleware/rateLimiter';
import { AstroChart } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class TrackController {
  private trackService: TrackService;
  private rateLimiter: RateLimiter;

  constructor(trackService: TrackService, rateLimiter: RateLimiter) {
    this.trackService = trackService;
    this.rateLimiter = rateLimiter;
  }

  // Get track by ID (for sharing)
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

      // Increment play count
      await this.trackService.incrementPlayCount(trackId);

      res.json({
        success: true,
        data: {
          track: {
            id: track.track_id,
            url: track.url,
            genre: track.genre,
            duration: track.duration,
            created_at: track.created_at,
            play_count: track.play_count,
            download_count: track.download_count,
            chart_data: track.chart_data
          }
        }
      });
    } catch (error) {
      console.error('Error getting track:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve track'
      });
    }
  }

  // Get user's track history
  async getUserTracks(req: Request, res: Response) {
    try {
      const userId = req.params.userId || req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const tracks = await this.trackService.getTracksByUserId(userId);
      
      res.json({
        success: true,
        data: {
          tracks: tracks.map(track => ({
            id: track.track_id,
            url: track.url,
            genre: track.genre,
            duration: track.duration,
            created_at: track.created_at,
            play_count: track.play_count,
            download_count: track.download_count
          }))
        }
      });
    } catch (error) {
      console.error('Error getting user tracks:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve user tracks'
      });
    }
  }

  // Get recent tracks (for discovery)
  async getRecentTracks(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const tracks = await this.trackService.getRecentTracks(limit);
      
      res.json({
        success: true,
        data: {
          tracks: tracks.map(track => ({
            id: track.track_id,
            url: track.url,
            genre: track.genre,
            duration: track.duration,
            created_at: track.created_at,
            play_count: track.play_count,
            download_count: track.download_count
          }))
        }
      });
    } catch (error) {
      console.error('Error getting recent tracks:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve recent tracks'
      });
    }
  }

  // Get popular tracks
  async getPopularTracks(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const tracks = await this.trackService.getPopularTracks(limit);
      
      res.json({
        success: true,
        data: {
          tracks: tracks.map(track => ({
            id: track.track_id,
            url: track.url,
            genre: track.genre,
            duration: track.duration,
            created_at: track.created_at,
            play_count: track.play_count,
            download_count: track.download_count
          }))
        }
      });
    } catch (error) {
      console.error('Error getting popular tracks:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve popular tracks'
      });
    }
  }

  // Download track
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

      // Increment download count
      await this.trackService.incrementDownloadCount(trackId);

      // Check if file exists
      const filePath = path.join(process.cwd(), 'public', track.url);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: 'Audio file not found'
        });
      }

      // Set headers for download
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Disposition', `attachment; filename="${trackId}.wav"`);
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error downloading track:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to download track'
      });
    }
  }

  // Get storage statistics (admin endpoint)
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
        error: 'Failed to retrieve storage statistics'
      });
    }
  }

  // Clean up old tracks (admin endpoint)
  async cleanupOldTracks(req: Request, res: Response) {
    try {
      const daysOld = parseInt(req.query.days as string) || 30;
      const deletedCount = await this.trackService.cleanupOldTracks(daysOld);
      
      res.json({
        success: true,
        data: {
          deletedCount,
          message: `Cleaned up ${deletedCount} tracks older than ${daysOld} days`
        }
      });
    } catch (error) {
      console.error('Error cleaning up old tracks:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cleanup old tracks'
      });
    }
  }

  // Get rate limit info for current session
  async getRateLimitInfo(req: Request, res: Response) {
    try {
      const sessionId = this.rateLimiter.getSessionId(req);
      const rateLimit = await this.trackService.checkRateLimit(sessionId);
      
      res.json({
        success: true,
        data: {
          allowed: rateLimit.allowed,
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime
        }
      });
    } catch (error) {
      console.error('Error getting rate limit info:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve rate limit information'
      });
    }
  }

  // Store track metadata after generation
  async storeTrackMetadata(req: Request, res: Response) {
    try {
      const {
        chartId,
        userId,
        url,
        genre,
        duration,
        fileSize,
        chartData,
        metadata
      } = req.body;

      const trackId = this.trackService.generateTrackId();
      
      const track = await this.trackService.createTrack({
        track_id: trackId,
        chart_id: chartId,
        user_id: userId,
        url,
        genre,
        duration,
        file_size: fileSize,
        chart_data: chartData,
        metadata
      });

      res.json({
        success: true,
        data: {
          track_id: track.track_id,
          url: track.url,
          message: 'Track metadata stored successfully'
        }
      });
    } catch (error) {
      console.error('Error storing track metadata:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to store track metadata'
      });
    }
  }
} 