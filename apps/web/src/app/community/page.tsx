'use client';

import React, { useState } from 'react';
import Navigation from '../../components/Navigation';
import UserLibrary from '../../components/UserLibrary';
import ShareTrackModal from '../../components/ShareTrackModal';
import CommunityDirectory from '../../components/CommunityDirectory';
import { AstroChart } from '../../types';

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

interface CommunityUser {
  id: string;
  username: string;
  avatar: string;
  chartData: AstroChart;
  genre: string;
  interpretation: string;
  isPublic: boolean;
  lastActive: Date;
  compatibility?: number;
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'library' | 'community'>('library');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SavedTrack | null>(null);
  const [currentUser, setCurrentUser] = useState<CommunityUser | null>(null);

  const handleTrackSelect = (track: SavedTrack) => {
    setSelectedTrack(track);
    // In a real app, this would navigate to a detailed view
    console.log('Selected track:', track);
  };

  const handleTrackDelete = (trackId: string) => {
    console.log('Deleting track:', trackId);
    // In a real app, this would remove from storage/database
  };

  const handleTrackPlay = (track: SavedTrack) => {
    console.log('Playing track:', track);
    // In a real app, this would start audio playback
  };

  const handleUserSelect = (user: CommunityUser) => {
    console.log('Selected user:', user);
    // In a real app, this would show user details
  };

  const handleCompareCharts = (user1: CommunityUser, user2: CommunityUser) => {
    console.log('Comparing charts:', user1, user2);
    // In a real app, this would navigate to overlay comparison
  };

  const handleShareTrack = (track: SavedTrack) => {
    setSelectedTrack(track);
    setShareModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1c2f] via-[#0f2f1f] to-[#0a1c2f] text-white">
      <Navigation />
      
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 glow-text leading-tight tracking-tight gradient-text-cosmic cosmic-glow-text font-mystical">
            Community & Library
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed tracking-wide font-mystical max-w-3xl mx-auto">
            Save your tracks, share with others, and discover cosmic connections
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="glass-morphism-strong rounded-2xl p-2 border border-emerald-500/20">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('library')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 font-mystical tracking-wide ${
                  activeTab === 'library'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cosmic-glow'
                    : 'text-gray-300 hover:text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                Your Library
              </button>
              <button
                onClick={() => setActiveTab('community')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 font-mystical tracking-wide ${
                  activeTab === 'community'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cosmic-glow'
                    : 'text-gray-300 hover:text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                Community
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20">
          {activeTab === 'library' ? (
            <UserLibrary
              onTrackSelect={handleTrackSelect}
              onTrackDelete={handleTrackDelete}
              onTrackPlay={handleTrackPlay}
            />
          ) : (
            <CommunityDirectory
              onUserSelect={handleUserSelect}
              onCompareCharts={handleCompareCharts}
              currentUser={currentUser || undefined}
            />
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20">
            <h3 className="section-header text-2xl mb-6">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setActiveTab('library')}
                className="p-6 glass-morphism rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-200"
              >
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📚</span>
                </div>
                <h4 className="text-lg font-semibold text-white font-mystical mb-2">
                  Your Library
                </h4>
                <p className="text-gray-400 font-mystical text-sm">
                  Manage your saved tracks and interpretations
                </p>
              </button>

              <button
                onClick={() => setActiveTab('community')}
                className="p-6 glass-morphism rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-200"
              >
                <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h4 className="text-lg font-semibold text-white font-mystical mb-2">
                  Community
                </h4>
                <p className="text-gray-400 font-mystical text-sm">
                  Discover and connect with other users
                </p>
              </button>

              <button
                onClick={() => setShareModalOpen(true)}
                className="p-6 glass-morphism rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-200"
              >
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📤</span>
                </div>
                <h4 className="text-lg font-semibold text-white font-mystical mb-2">
                  Share Track
                </h4>
                <p className="text-gray-400 font-mystical text-sm">
                  Share your latest creation with the world
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Features Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20">
            <h3 className="text-lg font-semibold text-emerald-300 font-mystical mb-4">
              🎼 User Library
            </h3>
            <ul className="space-y-2 text-sm text-gray-300 font-mystical">
              <li>• Save generated tracks with metadata</li>
              <li>• Organize by genre and mode</li>
              <li>• Quick playback and management</li>
              <li>• Export and share capabilities</li>
            </ul>
          </div>

          <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20">
            <h3 className="text-lg font-semibold text-violet-300 font-mystical mb-4">
              🌐 Community Features
            </h3>
            <ul className="space-y-2 text-sm text-gray-300 font-mystical">
              <li>• Browse public user profiles</li>
              <li>• Compare charts for compatibility</li>
              <li>• Filter by genre and activity</li>
              <li>• Social sharing and discovery</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareTrackModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        track={selectedTrack}
      />
    </div>
  );
} 