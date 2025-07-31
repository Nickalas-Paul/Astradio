'use client';

import React from 'react';

interface GenreDropdownProps {
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  className?: string;
  disabled?: boolean;
}

const GENRES = [
  { value: 'ambient', label: 'Ambient', emoji: '🌌' },
  { value: 'techno', label: 'Techno', emoji: '⚡' },
  { value: 'classical', label: 'Classical', emoji: '🎻' },
  { value: 'lofi', label: 'Lo-Fi', emoji: '☕' },
  { value: 'jazz', label: 'Jazz', emoji: '🎷' },
  { value: 'experimental', label: 'Experimental', emoji: '🔬' },
  { value: 'folk', label: 'Folk', emoji: '🌿' },
  { value: 'electronic', label: 'Electronic', emoji: '🎛️' },
  { value: 'rock', label: 'Rock', emoji: '🎸' },
  { value: 'blues', label: 'Blues', emoji: '💙' },
  { value: 'world', label: 'World', emoji: '🌍' },
  { value: 'chill', label: 'Chill', emoji: '🧘' }
];

export default function GenreDropdown({ 
  selectedGenre, 
  onGenreChange, 
  className = '',
  disabled = false
}: GenreDropdownProps) {
  const currentGenre = GENRES.find(g => g.value === selectedGenre) || GENRES[0];

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        🎵 Musical Genre
      </label>
      
      <div className="relative">
        <select
          value={selectedGenre}
          onChange={(e) => onGenreChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
        >
          {GENRES.map((genre) => (
            <option key={genre.value} value={genre.value}>
              {genre.emoji} {genre.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Genre description */}
      <div className="mt-2 text-xs text-gray-400">
        <span className="font-medium">{currentGenre.emoji} {currentGenre.label}</span>
        <span className="ml-2">
          {getGenreDescription(currentGenre.value)}
        </span>
      </div>
    </div>
  );
}

function getGenreDescription(genre: string): string {
  const descriptions: { [key: string]: string } = {
    ambient: 'Atmospheric, ethereal soundscapes',
    techno: 'Rhythmic, electronic energy',
    classical: 'Orchestral, harmonic compositions',
    lofi: 'Relaxed, nostalgic vibes',
    jazz: 'Smooth, improvisational melodies',
    experimental: 'Innovative, boundary-pushing sounds',
    folk: 'Organic, acoustic storytelling',
    electronic: 'Synthetic, digital textures',
    rock: 'Powerful, driving rhythms',
    blues: 'Soulful, emotional depth',
    world: 'Global, cultural fusion',
    chill: 'Peaceful, meditative tones'
  };
  
  return descriptions[genre] || 'Musical interpretation';
} 