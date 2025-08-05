'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGenre, GENRES } from '../context/GenreContext';

export default function GenreSelector() {
  const { selectedGenre, setSelectedGenre, getRandomGenre } = useGenre();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGenreSelect = (genreId: string) => {
    setSelectedGenre(genreId as any);
    setIsOpen(false);
  };

  const handleRandomGenre = () => {
    setSelectedGenre(getRandomGenre());
    setIsOpen(false);
  };

  const handleClearGenre = () => {
    setSelectedGenre('ambient');
    setIsOpen(false);
  };

  const selectedGenreData = selectedGenre ? GENRES.find(g => g.id === selectedGenre) : null;

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 transition-all duration-200 font-mystical text-sm tracking-wide">
          <span className="text-emerald-300">Genre</span>
          <svg
            className="w-4 h-4 text-emerald-300 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Genre Display Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all duration-200 font-mystical text-sm tracking-wide"
      >
        <span className="text-emerald-300">
          {selectedGenreData ? selectedGenreData.name : 'Genre'}
        </span>
        <svg
          className={`w-4 h-4 text-emerald-300 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 glass-morphism-strong rounded-xl border border-emerald-500/20 shadow-xl z-50">
          <div className="p-2">
            {/* Header */}
            <div className="px-3 py-2 border-b border-emerald-500/20 mb-2">
              <h3 className="text-sm font-semibold text-emerald-300 font-mystical">Select Genre</h3>
              <p className="text-xs text-gray-400 font-mystical">Choose your musical style</p>
            </div>

            {/* Genre Options */}
            <div className="max-h-60 overflow-y-auto space-y-1">
              {GENRES.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreSelect(genre.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 font-mystical ${
                    selectedGenre === genre.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-gray-300 hover:text-emerald-300 hover:bg-emerald-500/10'
                  }`}
                >
                  <div className="font-medium">{genre.name}</div>
                  <div className="text-xs text-gray-400">{genre.description}</div>
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="border-t border-emerald-500/20 mt-2 pt-2 space-y-1">
              <button
                onClick={handleRandomGenre}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-violet-300 hover:text-violet-200 hover:bg-violet-500/10 transition-all duration-200 font-mystical"
              >
                🎲 Random Genre
              </button>
              {selectedGenre && (
                <button
                  onClick={handleClearGenre}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-500/10 transition-all duration-200 font-mystical"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 