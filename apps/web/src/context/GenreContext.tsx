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
  selectedGenre: GenreId;
  setSelectedGenre: (genre: GenreId) => void;
  getRandomGenre: () => GenreId;
  genres: typeof GENRES;
}

const GenreContext = createContext<GenreContextType | undefined>(undefined);

export function GenreProvider({ children }: { children: React.ReactNode }) {
  // Use stable default to avoid hydration mismatch
  const [selectedGenre, setSelectedGenre] = useState<GenreId>('ambient');
  const [isClient, setIsClient] = useState(false);

  // Handle client-side initialization after hydration
  useEffect(() => {
    setIsClient(true);
    
    // Load from localStorage only after hydration
    const saved = localStorage.getItem('astradio-selected-genre');
    if (saved && GENRES.some(g => g.id === saved)) {
      setSelectedGenre(saved as GenreId);
    }
  }, []);

  // Save to localStorage whenever selectedGenre changes (only on client)
  useEffect(() => {
    if (isClient && selectedGenre) {
      localStorage.setItem('astradio-selected-genre', selectedGenre);
    }
  }, [selectedGenre, isClient]);

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