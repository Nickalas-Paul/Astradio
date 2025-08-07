-- Tracks table for storing generated audio metadata
CREATE TABLE IF NOT EXISTS tracks (
    id SERIAL PRIMARY KEY,
    track_id VARCHAR(255) UNIQUE NOT NULL, -- UUID or slug for public URLs
    chart_id VARCHAR(255) NOT NULL, -- e.g., "daily-2025-08-06" or "natal-user123"
    user_id VARCHAR(255), -- optional, for authenticated users
    url VARCHAR(500) NOT NULL, -- e.g., "/audio/daily-2025-08-06.wav"
    genre VARCHAR(50) NOT NULL DEFAULT 'ambient',
    duration INTEGER NOT NULL, -- in seconds
    file_size INTEGER, -- in bytes
    chart_data JSONB, -- store the actual chart data used
    metadata JSONB, -- additional metadata like aspects, planets, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT true,
    play_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0
);

-- Sessions table for rate limiting
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    generation_count INTEGER DEFAULT 0,
    daily_generation_count INTEGER DEFAULT 0,
    last_daily_reset DATE DEFAULT CURRENT_DATE
);

-- Daily tracks table for caching daily generations
CREATE TABLE IF NOT EXISTS daily_tracks (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    track_id VARCHAR(255) NOT NULL,
    chart_data JSONB NOT NULL,
    genre VARCHAR(50) DEFAULT 'ambient',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (track_id) REFERENCES tracks(track_id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tracks_user_id ON tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_tracks_created_at ON tracks(created_at);
CREATE INDEX IF NOT EXISTS idx_tracks_play_count ON tracks(play_count);
CREATE INDEX IF NOT EXISTS idx_tracks_genre ON tracks(genre);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_daily_tracks_date ON daily_tracks(date); 