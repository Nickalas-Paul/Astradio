'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export const GENRES = [
  { id: 'ambient', name: 'Ambient', description: 'Atmospheric and ethereal' },
  { id: 'techno', name: 'Techno', description: 'Electronic and rhythmic' },
  { id: 'classical', name: 'Classical', description: 'Orchestral and refined' },
  { id: 'lofi', name: 'Lo-fi', description: 'Chill and relaxed' },
  { id: 'jazz', name: 'Jazz', description: 'Smooth and improvisational' },
  { id: 'experimental', name: 'Experimental', description: 'Avant-garde and innovative' },
  { id: 'folk', name: 'Folk', description: 'Acoustic and organic' },
  { id: 'electronic', name: 'Electronic', description: 'Synthetic and digital' },
  { id: 'rock', name: 'Rock', description: 'Energetic and powerful' },
  { id: 'blues', name: 'Blues', description: 'Soulful and expressive' },
  { id: 'world', name: 'World', description: 'Cultural and diverse' },
  { id: 'chill', name: 'Chill', description: 'Calm and meditative' }
] as const;

export type GenreId = typeof GENRES[number]['id'];

interface GenreContextType {
  selectedGenre: GenreId | null;
  setSelectedGenre: (genre: GenreId | null) => void;
  getRandomGenre: () => GenreId;
  genres: typeof GENRES;
}

const GenreContext = createContext<GenreContextType | undefined>(undefined);

export function GenreProvider({ children }: { children: React.ReactNode }) {
  const [selectedGenre, setSelectedGenre] = useState<GenreId | null>(() => {
    // Try to load from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('astradio-selected-genre');
      return saved as GenreId || null;
    }
    return null;
  });

  // Save to localStorage whenever selectedGenre changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (selectedGenre) {
        localStorage.setItem('astradio-selected-genre', selectedGenre);
      } else {
        localStorage.removeItem('astradio-selected-genre');
      }
    }
  }, [selectedGenre]);

  const getRandomGenre = (): GenreId => {
    const randomIndex = Math.floor(Math.random() * GENRES.length);
    return GENRES[randomIndex].id;
  };

  const value: GenreContextType = {
    selectedGenre,
    setSelectedGenre,
    getRandomGenre,
    genres: GENRES
  };

  return (
    <GenreContext.Provider value={value}>
      {children}
    </GenreContext.Provider>
  );
}

export function useGenre() {
  const context = useContext(GenreContext);
  if (context === undefined) {
    throw new Error('useGenre must be used within a GenreProvider');
  }
  return context;
} 