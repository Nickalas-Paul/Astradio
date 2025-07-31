'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AstroChart, AudioStatus } from '../types';
import { useGenre } from '../context/GenreContext';

interface SavedTrack {
  id: string;
  title: string;
  chartData: AstroChart;
  genre: string;
  interpretation: string;
  timestamp: Date;
  mode: 'daily' | 'overlay' | 'sandbox';
  audioUrl?: string;
  isPlaying: boolean;
}

interface UserLibraryProps {
  onTrackSelect: (track: SavedTrack) => void;
  onTrackDelete: (trackId: string) => void;
  onTrackPlay: (track: SavedTrack) => void;
}

export default function UserLibrary({ onTrackSelect, onTrackDelete, onTrackPlay }: UserLibraryProps) {
  const [savedTracks, setSavedTracks] = useState<SavedTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<SavedTrack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedGenre } = useGenre();

  // Load saved tracks from localStorage on mount
  useEffect(() => {
    loadSavedTracks();
  }, []);

  const loadSavedTracks = () => {
    try {
      const saved = localStorage.getItem('astradio-saved-tracks');
      if (saved) {
        const tracks = JSON.parse(saved).map((track: any) => ({
          ...track,
          timestamp: new Date(track.timestamp)
        }));
        setSavedTracks(tracks);
      }
    } catch (error) {
      console.error('Failed to load saved tracks:', error);
    }
  };

  const saveTrack = (track: Omit<SavedTrack, 'id' | 'timestamp'>) => {
    const newTrack: SavedTrack = {
      ...track,
      id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    const updatedTracks = [newTrack, ...savedTracks];
    setSavedTracks(updatedTracks);
    
    // Save to localStorage
    localStorage.setItem('astradio-saved-tracks', JSON.stringify(updatedTracks));
  };

  const deleteTrack = (trackId: string) => {
    const updatedTracks = savedTracks.filter(track => track.id !== trackId);
    setSavedTracks(updatedTracks);
    localStorage.setItem('astradio-saved-tracks', JSON.stringify(updatedTracks));
    onTrackDelete(trackId);
  };

  const handleTrackPlay = (track: SavedTrack) => {
    // Stop all other tracks
    setSavedTracks(prev => prev.map(t => ({ ...t, isPlaying: false })));
    
    // Start selected track
    const updatedTrack = { ...track, isPlaying: true };
    setSavedTracks(prev => prev.map(t => t.id === track.id ? updatedTrack : t));
    
    onTrackPlay(updatedTrack);
  };

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'daily': return '🌅';
      case 'overlay': return '🔄';
      case 'sandbox': return '🎨';
      default: return '🎵';
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'daily': return 'text-emerald-400';
      case 'overlay': return 'text-violet-400';
      case 'sandbox': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-header text-2xl">
            Your Library
          </h2>
          <p className="text-gray-400 font-mystical mt-2">
            {savedTracks.length} saved track{savedTracks.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {savedTracks.length > 0 && (
          <button
            onClick={() => setSavedTracks([])}
            className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all duration-200 font-mystical text-red-300 text-sm"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Tracks Grid */}
      <AnimatePresence>
        {savedTracks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 glass-morphism-strong rounded-3xl border border-emerald-500/20"
          >
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎵</span>
            </div>
            <h3 className="text-xl font-semibold text-emerald-300 font-mystical mb-2">
              No Saved Tracks
            </h3>
            <p className="text-gray-400 font-mystical">
              Generate some tracks to see them here
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedTracks.map((track) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-morphism-strong rounded-2xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-200"
              >
                {/* Track Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getModeIcon(track.mode)}</span>
                    <div>
                      <h3 className="font-semibold text-white font-mystical">
                        {track.title}
                      </h3>
                      <p className={`text-sm font-mystical ${getModeColor(track.mode)}`}>
                        {track.mode.charAt(0).toUpperCase() + track.mode.slice(1)} Mode
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteTrack(track.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Chart Preview */}
                <div className="w-full h-32 bg-gradient-to-br from-emerald-500/10 to-violet-500/10 rounded-xl flex items-center justify-center mb-4 border border-emerald-500/20">
                  <div className="w-16 h-16 chart-wheel rounded-full border-2 border-emerald-500/30 flex items-center justify-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-violet-500 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Track Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 font-mystical">Genre</span>
                    <span className="text-sm text-emerald-300 font-mystical capitalize">
                      {track.genre}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 font-mystical">Created</span>
                    <span className="text-sm text-gray-400 font-mystical">
                      {formatTimestamp(track.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTrackPlay(track)}
                    className={`flex-1 px-4 py-2 rounded-xl font-mystical text-sm transition-all duration-200 ${
                      track.isPlaying
                        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                        : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                    }`}
                  >
                    {track.isPlaying ? 'Playing' : 'Play'}
                  </button>
                  
                  <button
                    onClick={() => onTrackSelect(track)}
                    className="px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-xl hover:bg-violet-500/30 transition-all duration-200 font-mystical text-violet-300 text-sm"
                  >
                    View
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 