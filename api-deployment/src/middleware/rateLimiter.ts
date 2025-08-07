import { Request, Response, NextFunction } from 'express';
import { TrackService } from '../services/trackService';

export class RateLimiter {
  private trackService: TrackService;

  constructor(trackService: TrackService) {
    this.trackService = trackService;
  }

  public getSessionId(req: Request): string {
    // Try to get from cookie first
    const sessionCookie = req.cookies?.session_id;
    if (sessionCookie) {
      return sessionCookie;
    }

    // Generate from IP and User-Agent as fallback
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    return this.simpleHash(`${ip}-${userAgent}`);
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  audioGenerationLimiter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = this.getSessionId(req);
      const rateLimit = await this.trackService.checkRateLimit(sessionId);

      if (!rateLimit.allowed) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          message: 'Daily generation limit reached. Please upgrade to Pro for unlimited generations.',
          remaining: 0,
          resetTime: rateLimit.resetTime
        });
      }

      // Add rate limit info to response headers
      res.set({
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime?.toISOString() || ''
      });

      // Store session ID in cookie for future requests
      res.cookie('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: 'strict'
      });

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Allow request to proceed if rate limiting fails
      next();
    }
  };

  generalLimiter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = this.getSessionId(req);
      const rateLimit = await this.trackService.checkRateLimit(sessionId);

      // For general endpoints, we're more lenient
      if (rateLimit.remaining < 0) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          remaining: 0
        });
      }

      res.set({
        'X-RateLimit-Remaining': rateLimit.remaining.toString()
      });

      next();
    } catch (error) {
      console.error('General rate limiter error:', error);
      next();
    }
  };

  incrementGenerationCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = this.getSessionId(req);
      await this.trackService.incrementGenerationCount(sessionId);
      next();
    } catch (error) {
      console.error('Failed to increment generation count:', error);
      next();
    }
  };

  trackPlayEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { trackId } = req.params;
      if (trackId) {
        await this.trackService.incrementPlayCount(trackId);
      }
      next();
    } catch (error) {
      console.error('Failed to track play event:', error);
      next();
    }
  };

  trackDownloadEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { trackId } = req.params;
      if (trackId) {
        await this.trackService.incrementDownloadCount(trackId);
      }
      next();
    } catch (error) {
      console.error('Failed to track download event:', error);
      next();
    }
  };
} 