'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth, User } from '../context/AuthContext';

export default function FriendFinder() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const { searchUsers, addFriend, getFriends } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const friendsList = await getFriends();
        setFriends(friendsList);
      } catch (error) {
        console.error('Failed to load friends:', error);
      }
    };
    loadFriends();
  }, [getFriends]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriend = async (userId: string) => {
    try {
      await addFriend(userId);
      // Remove from search results
      setSearchResults(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Failed to add friend:', error);
    }
  };

  const isAlreadyFriend = (userId: string) => {
    return friends.some(friend => friend.id === userId);
  };

  const isCurrentUser = (userId: string) => {
    // This would be replaced with actual current user check
    return false;
  };

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20 mb-8">
          <h1 className="section-header text-3xl mb-4">Find Friends</h1>
          <p className="text-gray-300 font-mystical mb-6">
            Connect with other cosmic music creators and share your astrological compositions
          </p>
          
          {/* Search Bar */}
          <div className="flex space-x-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by username or email..."
              className="form-input flex-1"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="btn-cosmic px-6 py-3 rounded-xl font-mystical disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </div>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20 mb-8"
          >
            <h2 className="section-header text-2xl mb-6">Search Results</h2>
            <div className="space-y-4">
              {searchResults.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 glass-morphism rounded-xl border border-emerald-500/20">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-violet-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white font-mystical">{user.username}</h3>
                      <p className="text-sm text-gray-400 font-mystical">
                        {user.isPublic ? 'Public Profile' : 'Private Profile'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {isCurrentUser(user.id) ? (
                      <span className="px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400 text-sm font-mystical">
                        You
                      </span>
                    ) : isAlreadyFriend(user.id) ? (
                      <span className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm font-mystical">
                        Friends
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddFriend(user.id)}
                        className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 hover:bg-emerald-500/30 transition-colors text-sm font-mystical"
                      >
                        Add Friend
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-lg text-violet-300 hover:bg-violet-500/30 transition-colors text-sm font-mystical"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Current Friends */}
        <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20">
          <h2 className="section-header text-2xl mb-6">Your Friends</h2>
          
          {friends.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2 font-mystical">No friends yet</h3>
              <p className="text-gray-300 font-mystical mb-6">
                Start searching to connect with other cosmic music creators
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="btn-cosmic px-6 py-3 rounded-xl font-mystical"
              >
                Start Searching
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {friends.map((friend) => (
                <div key={friend.id} className="glass-morphism rounded-xl p-6 border border-emerald-500/20">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-violet-500 rounded-full flex items-center justify-center text-white font-bold">
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white font-mystical">{friend.username}</h3>
                      <p className="text-sm text-gray-400 font-mystical">
                        Last active {new Date(friend.lastActive).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 hover:bg-emerald-500/30 transition-colors text-sm font-mystical">
                      Compare Charts
                    </button>
                    <button className="flex-1 py-2 bg-violet-500/20 border border-violet-500/30 rounded-lg text-violet-300 hover:bg-violet-500/30 transition-colors text-sm font-mystical">
                      Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Modal */}
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
              className="glass-morphism-strong rounded-2xl p-8 w-full max-w-md border border-emerald-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-violet-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-white font-mystical mb-2">
                  {selectedUser.username}
                </h2>
                <p className="text-gray-300 font-mystical">
                  {selectedUser.isPublic ? 'Public Profile' : 'Private Profile'}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mystical">Member since</span>
                  <span className="text-white font-mystical">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mystical">Last active</span>
                  <span className="text-white font-mystical">
                    {new Date(selectedUser.lastLogin).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                {!isAlreadyFriend(selectedUser.id) && !isCurrentUser(selectedUser.id) && (
                  <button
                    onClick={() => {
                      handleAddFriend(selectedUser.id);
                      setSelectedUser(null);
                    }}
                    className="flex-1 btn-cosmic py-3 rounded-xl font-mystical"
                  >
                    Add Friend
                  </button>
                )}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 px-6 py-3 bg-gray-600/20 border border-gray-600/30 rounded-xl text-gray-300 hover:bg-gray-600/30 font-mystical"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 