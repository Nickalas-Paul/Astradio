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
  chart_data?: AstroChart;
  metadata?: any;
  created_at?: Date;
  updated_at?: Date;
  is_public?: boolean;
  play_count?: number;
  download_count?: number;
}

export interface SessionData {
  id?: number;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  created_at?: Date;
  last_activity?: Date;
  generation_count?: number;
  daily_generation_count?: number;
  last_daily_reset?: Date;
}

export class TrackService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  generateTrackId(): string {
    return uuidv4().replace(/-/g, '').substring(0, 12);
  }

  async createTrack(trackData: Omit<TrackMetadata, 'id' | 'created_at'>): Promise<TrackMetadata> {
    const query = `
      INSERT INTO tracks (
        track_id, chart_id, user_id, url, genre, duration, 
        file_size, chart_data, metadata, is_public, play_count, download_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
      trackData.chart_data ? JSON.stringify(trackData.chart_data) : null,
      trackData.metadata ? JSON.stringify(trackData.metadata) : null,
      trackData.is_public !== false,
      trackData.play_count || 0,
      trackData.download_count || 0
    ];

    const result = await this.pool.query(query, values);
    return this.mapTrackFromDb(result.rows[0]);
  }

  async getTrackByTrackId(trackId: string): Promise<TrackMetadata | null> {
    const query = 'SELECT * FROM tracks WHERE track_id = $1';
    const result = await this.pool.query(query, [trackId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapTrackFromDb(result.rows[0]);
  }

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

  async getDailyTrack(date: string): Promise<TrackMetadata | null> {
    const query = `
      SELECT t.* FROM tracks t
      INNER JOIN daily_tracks dt ON t.track_id = dt.track_id
      WHERE dt.date = $1
    `;
    
    const result = await this.pool.query(query, [date]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapTrackFromDb(result.rows[0]);
  }

  async createDailyTrack(date: string, trackId: string, chartData: AstroChart, genre = 'ambient'): Promise<void> {
    const query = 'INSERT INTO daily_tracks (date, track_id, chart_data, genre) VALUES ($1, $2, $3, $4)';
    await this.pool.query(query, [date, trackId, JSON.stringify(chartData), genre]);
  }

  async incrementPlayCount(trackId: string): Promise<void> {
    const query = 'UPDATE tracks SET play_count = play_count + 1 WHERE track_id = $1';
    await this.pool.query(query, [trackId]);
  }

  async incrementDownloadCount(trackId: string): Promise<void> {
    const query = 'UPDATE tracks SET download_count = download_count + 1 WHERE track_id = $1';
    await this.pool.query(query, [trackId]);
  }

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

  async getOrCreateSession(sessionId: string, ipAddress?: string, userAgent?: string): Promise<SessionData> {
    // Try to get existing session
    let query = 'SELECT * FROM sessions WHERE session_id = $1';
    let result = await this.pool.query(query, [sessionId]);
    
    if (result.rows.length > 0) {
      return this.mapSessionFromDb(result.rows[0]);
    }

    // Create new session
    query = `
      INSERT INTO sessions (session_id, ip_address, user_agent, generation_count, daily_generation_count)
      VALUES ($1, $2, $3, 0, 0)
      RETURNING *
    `;
    
    result = await this.pool.query(query, [sessionId, ipAddress, userAgent]);
    return this.mapSessionFromDb(result.rows[0]);
  }

  async checkRateLimit(sessionId: string): Promise<{ allowed: boolean; remaining: number; resetTime?: Date }> {
    const session = await this.getOrCreateSession(sessionId);
    
    // Check if we need to reset daily count
    const today = new Date().toISOString().split('T')[0];
    if (session.last_daily_reset && session.last_daily_reset.toISOString().split('T')[0] !== today) {
      await this.resetDailyCount(sessionId);
      session.daily_generation_count = 0;
    }

    const remaining = Math.max(0, 10 - (session.daily_generation_count || 0));
    const allowed = remaining > 0;

    return {
      allowed,
      remaining,
      resetTime: session.last_daily_reset
    };
  }

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

  async resetDailyCount(sessionId: string): Promise<void> {
    const query = `
      UPDATE sessions 
      SET daily_generation_count = 0,
          last_daily_reset = CURRENT_DATE
      WHERE session_id = $1
    `;
    
    await this.pool.query(query, [sessionId]);
  }

  async cleanupOldTracks(daysOld = 30): Promise<number> {
    const query = `
      DELETE FROM tracks 
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '$1 days'
      AND user_id IS NULL
    `;
    
    const result = await this.pool.query(query, [daysOld]);
    return result.rowCount || 0;
  }

  async getStorageStats(): Promise<{
    totalTracks: number;
    totalSize: number;
    averageDuration: number;
    genres: { [key: string]: number };
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_tracks,
        COALESCE(SUM(file_size), 0) as total_size,
        COALESCE(AVG(duration), 0) as avg_duration,
        genre,
        COUNT(*) as genre_count
      FROM tracks 
      GROUP BY genre
    `;
    
    const result = await this.pool.query(query);
    
    const stats = {
      totalTracks: 0,
      totalSize: 0,
      averageDuration: 0,
      genres: {} as { [key: string]: number }
    };

    result.rows.forEach(row => {
      stats.totalTracks += parseInt(row.genre_count);
      stats.totalSize += parseInt(row.total_size || 0);
      stats.genres[row.genre] = parseInt(row.genre_count);
    });

    if (stats.totalTracks > 0) {
      stats.averageDuration = stats.totalSize / stats.totalTracks;
    }

    return stats;
  }

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
      chart_data: row.chart_data ? JSON.parse(row.chart_data) : undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
      is_public: row.is_public,
      play_count: row.play_count,
      download_count: row.download_count
    };
  }

  private mapSessionFromDb(row: any): SessionData {
    return {
      id: row.id,
      session_id: row.session_id,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
      created_at: row.created_at,
      last_activity: row.last_activity,
      generation_count: row.generation_count,
      daily_generation_count: row.daily_generation_count,
      last_daily_reset: row.last_daily_reset
    };
  }
} 