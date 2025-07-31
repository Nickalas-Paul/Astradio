'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AstroChart } from '../types';

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

interface CommunityDirectoryProps {
  onUserSelect: (user: CommunityUser) => void;
  onCompareCharts: (user1: CommunityUser, user2: CommunityUser) => void;
  currentUser?: CommunityUser;
}

// Mock community data - in a real app, this would come from a database
const MOCK_COMMUNITY_USERS: CommunityUser[] = [
  {
    id: 'user_1',
    username: 'CosmicHarmony',
    avatar: '🌙',
    chartData: {} as AstroChart,
    genre: 'ambient',
    interpretation: 'A peaceful soul with lunar energy flowing through their chart.',
    isPublic: true,
    lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    compatibility: 85
  },
  {
    id: 'user_2',
    username: 'StellarVibes',
    avatar: '⭐',
    chartData: {} as AstroChart,
    genre: 'jazz',
    interpretation: 'Jazz-infused cosmic energy with smooth planetary alignments.',
    isPublic: true,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    compatibility: 72
  },
  {
    id: 'user_3',
    username: 'AstroBeats',
    avatar: '🎵',
    chartData: {} as AstroChart,
    genre: 'techno',
    interpretation: 'Electronic rhythms mirroring the digital age of astrology.',
    isPublic: true,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    compatibility: 93
  },
  {
    id: 'user_4',
    username: 'MysticMelody',
    avatar: '🔮',
    chartData: {} as AstroChart,
    genre: 'classical',
    interpretation: 'Orchestral arrangements reflecting classical astrological wisdom.',
    isPublic: true,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    compatibility: 68
  },
  {
    id: 'user_5',
    username: 'ZenFrequencies',
    avatar: '🧘',
    chartData: {} as AstroChart,
    genre: 'lofi',
    interpretation: 'Chill vibes with meditative planetary harmonies.',
    isPublic: true,
    lastActive: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    compatibility: 91
  }
];

export default function CommunityDirectory({ onUserSelect, onCompareCharts, currentUser }: CommunityDirectoryProps) {
  const [users, setUsers] = useState<CommunityUser[]>(MOCK_COMMUNITY_USERS);
  const [selectedUser, setSelectedUser] = useState<CommunityUser | null>(null);
  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'compatibility' | 'name'>('recent');

  const filteredUsers = users
    .filter(user => user.isPublic)
    .filter(user => filterGenre === 'all' || user.genre === filterGenre)
    .filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'compatibility':
          return (b.compatibility || 0) - (a.compatibility || 0);
        case 'name':
          return a.username.localeCompare(b.username);
        case 'recent':
        default:
          return b.lastActive.getTime() - a.lastActive.getTime();
      }
    });

  const handleUserSelect = (user: CommunityUser) => {
    setSelectedUser(user);
    onUserSelect(user);
  };

  const handleCompare = (user: CommunityUser) => {
    if (currentUser) {
      onCompareCharts(currentUser, user);
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 75) return 'text-violet-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-gray-400';
  };

  const formatLastActive = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-header text-2xl">
            Community
          </h2>
          <p className="text-gray-400 font-mystical mt-2">
            {filteredUsers.length} active users
          </p>
        </div>
        
        {currentUser && (
          <button
            onClick={() => setSelectedUser(currentUser)}
            className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/30 transition-all duration-200 font-mystical text-emerald-300 text-sm"
          >
            My Profile
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-morphism-strong rounded-2xl p-6 border border-emerald-500/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 font-mystical mb-2">
              Search Users
            </label>
            <input
              type="text"
              placeholder="Find users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full form-input"
            />
          </div>

          {/* Genre Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 font-mystical mb-2">
              Filter by Genre
            </label>
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="w-full form-input"
            >
              <option value="all">All Genres</option>
              <option value="ambient">Ambient</option>
              <option value="jazz">Jazz</option>
              <option value="techno">Techno</option>
              <option value="classical">Classical</option>
              <option value="lofi">Lo-fi</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-300 font-mystical mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full form-input"
            >
              <option value="recent">Most Recent</option>
              <option value="compatibility">Compatibility</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <AnimatePresence>
        {filteredUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 glass-morphism-strong rounded-3xl border border-emerald-500/20"
          >
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold text-emerald-300 font-mystical mb-2">
              No Users Found
            </h3>
            <p className="text-gray-400 font-mystical">
              Try adjusting your filters or search terms
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-morphism-strong rounded-2xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-200"
              >
                {/* User Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-violet-500 rounded-full flex items-center justify-center text-2xl">
                      {user.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white font-mystical">
                        {user.username}
                      </h3>
                      <p className="text-sm text-gray-400 font-mystical">
                        {formatLastActive(user.lastActive)}
                      </p>
                    </div>
                  </div>
                  
                  {user.compatibility && (
                    <div className="text-right">
                      <div className={`text-sm font-semibold font-mystical ${getCompatibilityColor(user.compatibility)}`}>
                        {user.compatibility}%
                      </div>
                      <div className="text-xs text-gray-400 font-mystical">
                        Match
                      </div>
                    </div>
                  )}
                </div>

                {/* Chart Preview */}
                <div className="w-full h-24 bg-gradient-to-br from-emerald-500/10 to-violet-500/10 rounded-xl flex items-center justify-center mb-4 border border-emerald-500/20">
                  <div className="w-12 h-12 chart-wheel rounded-full border-2 border-emerald-500/30 flex items-center justify-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-violet-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 font-mystical">Genre</span>
                    <span className="text-sm text-emerald-300 font-mystical capitalize">
                      {user.genre}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-400 font-mystical leading-relaxed">
                    {user.interpretation.substring(0, 80)}...
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUserSelect(user)}
                    className="flex-1 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/30 transition-all duration-200 font-mystical text-emerald-300 text-sm"
                  >
                    View Chart
                  </button>
                  
                  {currentUser && (
                    <button
                      onClick={() => handleCompare(user)}
                      className="px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-xl hover:bg-violet-500/30 transition-all duration-200 font-mystical text-violet-300 text-sm"
                    >
                      Compare
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Selected User Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-morphism-strong rounded-3xl p-8 max-w-2xl w-full border border-emerald-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* User Profile Header */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-violet-500 rounded-full flex items-center justify-center text-3xl">
                  {selectedUser.avatar}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white font-mystical">
                    {selectedUser.username}
                  </h2>
                  <p className="text-emerald-300 font-mystical capitalize">
                    {selectedUser.genre} • {formatLastActive(selectedUser.lastActive)}
                  </p>
                </div>
              </div>

              {/* Chart Display */}
              <div className="mb-6">
                <h3 className="section-header text-xl mb-4">
                  Chart
                </h3>
                <div className="w-full h-64 bg-gradient-to-br from-emerald-500/10 to-violet-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <div className="w-24 h-24 chart-wheel rounded-full border-2 border-emerald-500/30 flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-violet-500 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interpretation */}
              <div className="mb-6">
                <h3 className="section-header text-xl mb-4">
                  Interpretation
                </h3>
                <p className="text-gray-300 font-mystical leading-relaxed">
                  {selectedUser.interpretation}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 px-6 py-3 bg-gray-600/20 border border-gray-500/30 rounded-xl hover:bg-gray-600/30 transition-all duration-200 font-mystical text-gray-300"
                >
                  Close
                </button>
                {currentUser && (
                  <button
                    onClick={() => {
                      handleCompare(selectedUser);
                      setSelectedUser(null);
                    }}
                    className="flex-1 px-6 py-3 btn-cosmic rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 glow font-mystical"
                  >
                    Compare Charts
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 