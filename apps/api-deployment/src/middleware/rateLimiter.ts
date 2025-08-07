import { Request, Response, NextFunction } from 'express';
import { TrackService } from '../services/trackService';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
  statusCode?: number;
}

export class RateLimiter {
  private trackService: TrackService;

  constructor(trackService: TrackService) {
    this.trackService = trackService;
  }

  // Generate session ID from request
  public getSessionId(req: Request): string {
    // Try to get from cookie first
    const sessionCookie = req.cookies?.session_id;
    if (sessionCookie) {
      return sessionCookie;
    }

    // Fallback to IP + User-Agent hash
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    const hash = this.simpleHash(ip + userAgent);
    
    return `anon_${hash}`;
  }

  // Simple hash function
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Rate limiting middleware for audio generation
  async audioGenerationLimiter(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = this.getSessionId(req);
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      // Check rate limits
      const rateLimit = await this.trackService.checkRateLimit(sessionId);
      
      if (!rateLimit.allowed) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          message: `You've reached your daily limit. Please try again tomorrow or upgrade for unlimited generations.`,
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime
        });
      }

      // Store session info for tracking
      await this.trackService.getOrCreateSession(sessionId, ipAddress, userAgent);

      // Add rate limit info to response headers
      res.set({
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime?.toISOString()
      });

      // Add session ID to response for client to store
      res.cookie('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      // On error, allow the request but log it
      next();
    }
  }

  // Rate limiting middleware for general API endpoints
  async generalLimiter(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = this.getSessionId(req);
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      // For general endpoints, use a more lenient limit
      const rateLimit = await this.trackService.checkRateLimit(sessionId);
      
      // Allow more requests for general endpoints
      const maxGeneralRequests = 100;
      const allowed = rateLimit.remaining > 0 || rateLimit.remaining + maxGeneralRequests > 0;

      if (!allowed) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please slow down.',
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime
        });
      }

      // Store session info
      await this.trackService.getOrCreateSession(sessionId, ipAddress, userAgent);

      // Add rate limit info to response headers
      res.set({
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime?.toISOString()
      });

      // Add session ID to response
      res.cookie('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      next();
    } catch (error) {
      console.error('General rate limiting error:', error);
      next();
    }
  }

  // Middleware to increment generation count after successful generation
  async incrementGenerationCount(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = this.getSessionId(req);
      await this.trackService.incrementGenerationCount(sessionId);
      next();
    } catch (error) {
      console.error('Error incrementing generation count:', error);
      next();
    }
  }

  // Middleware to track play/download events
  async trackPlayEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { trackId } = req.params;
      if (trackId) {
        await this.trackService.incrementPlayCount(trackId);
      }
      next();
    } catch (error) {
      console.error('Error tracking play event:', error);
      next();
    }
  }

  async trackDownloadEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { trackId } = req.params;
      if (trackId) {
        await this.trackService.incrementDownloadCount(trackId);
      }
      next();
    } catch (error) {
      console.error('Error tracking download event:', error);
      next();
    }
  }
} 