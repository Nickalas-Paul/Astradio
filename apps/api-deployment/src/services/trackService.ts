import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { AstroChart } from '../types';

export interface TrackMetadata {
  id?: number;
  track_id: string;
  chart_id: string;
  user_id?: string;
  url: string;
  genre: string;
  duration: number;
  file_size?: number;
  chart_data: AstroChart;
  metadata?: any;
  created_at?: Date;
  is_public?: boolean;
  play_count?: number;
  download_count?: number;
}

export interface SessionData {
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  generation_count: number;
  daily_generation_count: number;
  last_daily_reset: Date;
}

export class TrackService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  // Generate a unique track ID
  generateTrackId(): string {
    return uuidv4().replace(/-/g, '').substring(0, 12);
  }

  // Store track metadata
  async createTrack(trackData: Omit<TrackMetadata, 'id' | 'created_at'>): Promise<TrackMetadata> {
    const query = `
      INSERT INTO tracks (
        track_id, chart_id, user_id, url, genre, duration, 
        file_size, chart_data, metadata, is_public
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      trackData.track_id,
      trackData.chart_id,
      trackData.user_id || null,
      trackData.url,
      trackData.genre,
      trackData.duration,
      trackData.file_size || null,
      JSON.stringify(trackData.chart_data),
      trackData.metadata ? JSON.stringify(trackData.metadata) : null,
      trackData.is_public ?? true
    ];

    const result = await this.pool.query(query, values);
    return this.mapTrackFromDb(result.rows[0]);
  }

  // Get track by track_id
  async getTrackByTrackId(trackId: string): Promise<TrackMetadata | null> {
    const query = 'SELECT * FROM tracks WHERE track_id = $1';
    const result = await this.pool.query(query, [trackId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapTrackFromDb(result.rows[0]);
  }

  // Get tracks by user_id
  async getTracksByUserId(userId: string, limit = 50): Promise<TrackMetadata[]> {
    const query = `
      SELECT * FROM tracks 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    
    const result = await this.pool.query(query, [userId, limit]);
    return result.rows.map(row => this.mapTrackFromDb(row));
  }

  // Get daily track for a specific date
  async getDailyTrack(date: string): Promise<TrackMetadata | null> {
    const query = `
      SELECT t.* FROM tracks t
      JOIN daily_tracks dt ON t.track_id = dt.track_id
      WHERE dt.date = $1
    `;
    
    const result = await this.pool.query(query, [date]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapTrackFromDb(result.rows[0]);
  }

  // Store daily track
  async createDailyTrack(date: string, trackId: string, chartData: AstroChart, genre = 'ambient'): Promise<void> {
    const query = `
      INSERT INTO daily_tracks (date, track_id, chart_data, genre)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (date) DO UPDATE SET
        track_id = EXCLUDED.track_id,
        chart_data = EXCLUDED.chart_data,
        genre = EXCLUDED.genre,
        created_at = CURRENT_TIMESTAMP
    `;

    await this.pool.query(query, [date, trackId, JSON.stringify(chartData), genre]);
  }

  // Increment play count
  async incrementPlayCount(trackId: string): Promise<void> {
    const query = 'UPDATE tracks SET play_count = play_count + 1 WHERE track_id = $1';
    await this.pool.query(query, [trackId]);
  }

  // Increment download count
  async incrementDownloadCount(trackId: string): Promise<void> {
    const query = 'UPDATE tracks SET download_count = download_count + 1 WHERE track_id = $1';
    await this.pool.query(query, [trackId]);
  }

  // Get recent tracks (for discovery)
  async getRecentTracks(limit = 20): Promise<TrackMetadata[]> {
    const query = `
      SELECT * FROM tracks 
      WHERE is_public = true 
      ORDER BY created_at DESC 
      LIMIT $1
    `;
    
    const result = await this.pool.query(query, [limit]);
    return result.rows.map(row => this.mapTrackFromDb(row));
  }

  // Get popular tracks
  async getPopularTracks(limit = 20): Promise<TrackMetadata[]> {
    const query = `
      SELECT * FROM tracks 
      WHERE is_public = true 
      ORDER BY play_count DESC, created_at DESC 
      LIMIT $1
    `;
    
    const result = await this.pool.query(query, [limit]);
    return result.rows.map(row => this.mapTrackFromDb(row));
  }

  // Session management for rate limiting
  async getOrCreateSession(sessionId: string, ipAddress?: string, userAgent?: string): Promise<SessionData> {
    const query = `
      INSERT INTO sessions (session_id, ip_address, user_agent)
      VALUES ($1, $2, $3)
      ON CONFLICT (session_id) DO UPDATE SET
        last_activity = CURRENT_TIMESTAMP,
        ip_address = COALESCE(EXCLUDED.ip_address, sessions.ip_address),
        user_agent = COALESCE(EXCLUDED.user_agent, sessions.user_agent)
      RETURNING *
    `;

    const result = await this.pool.query(query, [sessionId, ipAddress, userAgent]);
    return this.mapSessionFromDb(result.rows[0]);
  }

  // Check rate limits
  async checkRateLimit(sessionId: string): Promise<{ allowed: boolean; remaining: number; resetTime?: Date }> {
    const session = await this.getOrCreateSession(sessionId);
    
    // Reset daily count if it's a new day
    const today = new Date().toISOString().split('T')[0];
    const lastReset = session.last_daily_reset.toISOString().split('T')[0];
    
    if (today !== lastReset) {
      await this.resetDailyCount(sessionId);
      session.daily_generation_count = 0;
    }

    const maxDaily = 10; // Free users get 10 generations per day
    const maxTotal = 50; // Total limit per session

    const allowed = session.daily_generation_count < maxDaily && session.generation_count < maxTotal;
    const remaining = Math.min(maxDaily - session.daily_generation_count, maxTotal - session.generation_count);

    return {
      allowed,
      remaining: Math.max(0, remaining),
      resetTime: new Date(today + 'T00:00:00Z')
    };
  }

  // Increment generation count
  async incrementGenerationCount(sessionId: string): Promise<void> {
    const query = `
      UPDATE sessions 
      SET generation_count = generation_count + 1,
          daily_generation_count = daily_generation_count + 1,
          last_activity = CURRENT_TIMESTAMP
      WHERE session_id = $1
    `;
    
    await this.pool.query(query, [sessionId]);
  }

  // Reset daily count
  async resetDailyCount(sessionId: string): Promise<void> {
    const query = `
      UPDATE sessions 
      SET daily_generation_count = 0,
          last_daily_reset = CURRENT_DATE
      WHERE session_id = $1
    `;
    
    await this.pool.query(query, [sessionId]);
  }

  // Clean up old tracks (for maintenance)
  async cleanupOldTracks(daysOld = 30): Promise<number> {
    const query = `
      DELETE FROM tracks 
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '${daysOld} days'
      AND user_id IS NULL
    `;
    
    const result = await this.pool.query(query);
    return result.rowCount || 0;
  }

  // Get storage stats
  async getStorageStats(): Promise<{
    totalTracks: number;
    totalSize: number;
    averageDuration: number;
    genres: { [key: string]: number };
  }> {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_tracks,
        COALESCE(SUM(file_size), 0) as total_size,
        COALESCE(AVG(duration), 0) as avg_duration
      FROM tracks
    `;
    
    const genresQuery = `
      SELECT genre, COUNT(*) as count
      FROM tracks
      GROUP BY genre
      ORDER BY count DESC
    `;

    const [statsResult, genresResult] = await Promise.all([
      this.pool.query(statsQuery),
      this.pool.query(genresQuery)
    ]);

    const stats = statsResult.rows[0];
    const genres = genresResult.rows.reduce((acc, row) => {
      acc[row.genre] = parseInt(row.count);
      return acc;
    }, {} as { [key: string]: number });

    return {
      totalTracks: parseInt(stats.total_tracks),
      totalSize: parseInt(stats.total_size),
      averageDuration: parseFloat(stats.avg_duration),
      genres
    };
  }

  // Helper methods for mapping database results
  private mapTrackFromDb(row: any): TrackMetadata {
    return {
      id: row.id,
      track_id: row.track_id,
      chart_id: row.chart_id,
      user_id: row.user_id,
      url: row.url,
      genre: row.genre,
      duration: row.duration,
      file_size: row.file_size,
      chart_data: row.chart_data,
      metadata: row.metadata,
      created_at: row.created_at,
      is_public: row.is_public,
      play_count: row.play_count,
      download_count: row.download_count
    };
  }

  private mapSessionFromDb(row: any): SessionData {
    return {
      session_id: row.session_id,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
      generation_count: row.generation_count,
      daily_generation_count: row.daily_generation_count,
      last_daily_reset: row.last_daily_reset
    };
  }
} 