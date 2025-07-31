'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth, SavedTrack } from '../context/AuthContext';

interface LibraryManagerProps {
  onSaveTrack: (track: Omit<SavedTrack, 'id' | 'createdAt' | 'playCount'>) => Promise<void>;
  onPlayTrack?: (trackId: string) => void;
  onShareTrack?: (trackId: string) => void;
}

export default function LibraryManager({ onSaveTrack, onPlayTrack, onShareTrack }: LibraryManagerProps) {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [trackTitle, setTrackTitle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [currentTrackData, setCurrentTrackData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { getSavedTracks, deleteTrack } = useAuth();
  const savedTracks = getSavedTracks();

  const handleSaveTrack = async (trackData: any, title: string, isPublic: boolean) => {
    setIsSaving(true);
    try {
      await onSaveTrack({
        title,
        chartType: trackData.chartType || 'sandbox',
        genre: trackData.genre || 'ambient',
        chartData: trackData.chartData,
        interpretation: trackData.interpretation || '',
        isPublic,
      });
      setIsSaveModalOpen(false);
      setTrackTitle('');
      setIsPublic(false);
      setCurrentTrackData(null);
    } catch (error) {
      console.error('Failed to save track:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    try {
      await deleteTrack(trackId);
    } catch (error) {
      console.error('Failed to delete track:', error);
    }
  };

  const openSaveModal = (trackData: any) => {
    setCurrentTrackData(trackData);
    setIsSaveModalOpen(true);
  };

  return (
    <>
      {/* Save Track Button */}
      <button
        onClick={() => openSaveModal({})}
        className="btn-cosmic px-6 py-3 rounded-xl font-mystical"
      >
        Save to Library
      </button>

      {/* Library Display */}
      {savedTracks.length > 0 && (
        <div className="mt-8">
          <h3 className="section-header text-xl mb-4">Your Library</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedTracks.map((track) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-morphism rounded-xl p-6 border border-emerald-500/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-white font-mystical">{track.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400 capitalize">{track.genre}</span>
                    {track.isPublic && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">
                        Public
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 mb-4 font-mystical line-clamp-3">
                  {track.interpretation.substring(0, 100)}...
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <span className="capitalize">{track.chartType}</span>
                  <span>{new Date(track.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {track.playCount} plays
                  </span>
                  <div className="flex space-x-2">
                    {onPlayTrack && (
                      <button
                        onClick={() => onPlayTrack(track.id)}
                        className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded text-emerald-300 hover:bg-emerald-500/30 transition-colors text-xs font-mystical"
                      >
                        Play
                      </button>
                    )}
                    {onShareTrack && (
                      <button
                        onClick={() => onShareTrack(track.id)}
                        className="px-3 py-1 bg-violet-500/20 border border-violet-500/30 rounded text-violet-300 hover:bg-violet-500/30 transition-colors text-xs font-mystical"
                      >
                        Share
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteTrack(track.id)}
                      className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-300 hover:bg-red-500/30 transition-colors text-xs font-mystical"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Save Track Modal */}
      {isSaveModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsSaveModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-morphism-strong rounded-2xl p-8 w-full max-w-md border border-emerald-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="section-header text-2xl mb-6">Save Track</h2>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Track Title</label>
                <input
                  type="text"
                  value={trackTitle}
                  onChange={(e) => setTrackTitle(e.target.value)}
                  className="form-input w-full"
                  placeholder="Enter track title..."
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-gray-600"
                />
                <label htmlFor="isPublic" className="form-label">Make track public</label>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => handleSaveTrack(currentTrackData, trackTitle, isPublic)}
                disabled={isSaving || !trackTitle.trim()}
                className="btn-cosmic px-6 py-2 rounded-xl font-mystical disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Track'}
              </button>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="px-6 py-2 bg-gray-600/20 border border-gray-600/30 rounded-xl text-gray-300 hover:bg-gray-600/30 font-mystical"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
} 