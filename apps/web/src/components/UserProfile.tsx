'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth, User, SavedTrack } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'library' | 'friends' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user.username,
    isPublic: user.isPublic,
  });
  
  const { updateProfile, getSavedTracks, getFriends, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const savedTracks = getSavedTracks();
  const friends = getFriends();

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'library', label: 'Library', icon: '🎼' },
    { id: 'friends', label: 'Friends', icon: '👥' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-violet-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white font-mystical mb-2">
                {user.username}
              </h1>
              <p className="text-gray-300 font-mystical">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.isPublic 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                }`}>
                  {user.isPublic ? 'Public Profile' : 'Private Profile'}
                </span>
                <span className="text-gray-400 text-sm">
                  {savedTracks.length} tracks • {friends.length} friends
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-xl font-mystical transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-gray-300 hover:text-emerald-300 hover:bg-emerald-500/10'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="section-header text-2xl mb-6">Profile Information</h2>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="form-input w-full"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={editForm.isPublic}
                      onChange={(e) => setEditForm({ ...editForm, isPublic: e.target.checked })}
                      className="rounded border-gray-600"
                    />
                    <label htmlFor="isPublic" className="form-label">Make profile public</label>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveProfile}
                      className="btn-cosmic px-6 py-2 rounded-xl font-mystical"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 bg-gray-600/20 border border-gray-600/30 rounded-xl text-gray-300 hover:bg-gray-600/30 font-mystical"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Email</label>
                    <p className="text-gray-300 font-mystical">{user.email}</p>
                  </div>
                  <div>
                    <label className="form-label">Username</label>
                    <p className="text-gray-300 font-mystical">{user.username}</p>
                  </div>
                  <div>
                    <label className="form-label">Profile Visibility</label>
                    <p className="text-gray-300 font-mystical">
                      {user.isPublic ? 'Public - Others can see your profile' : 'Private - Only you can see your profile'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-cosmic px-6 py-2 rounded-xl font-mystical"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'library' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="section-header text-2xl mb-6">Your Library</h2>
              
              {savedTracks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🎼</div>
                  <h3 className="text-xl font-semibold mb-2 font-mystical">No tracks yet</h3>
                  <p className="text-gray-300 font-mystical">
                    Start creating music to build your cosmic library
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedTracks.map((track) => (
                    <div key={track.id} className="glass-morphism rounded-xl p-6 border border-emerald-500/20">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white font-mystical">{track.title}</h3>
                        <span className="text-xs text-gray-400 capitalize">{track.genre}</span>
                      </div>
                      <p className="text-sm text-gray-300 mb-4 font-mystical">
                        {track.interpretation.substring(0, 100)}...
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="capitalize">{track.chartType}</span>
                        <span>{new Date(track.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <button className="flex-1 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 hover:bg-emerald-500/30 transition-colors text-sm font-mystical">
                          Play
                        </button>
                        <button className="flex-1 py-2 bg-violet-500/20 border border-violet-500/30 rounded-lg text-violet-300 hover:bg-violet-500/30 transition-colors text-sm font-mystical">
                          Share
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'friends' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="section-header text-2xl mb-6">Friends</h2>
              
              {friends.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold mb-2 font-mystical">No friends yet</h3>
                  <p className="text-gray-300 font-mystical">
                    Connect with other cosmic music creators
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-4 glass-morphism rounded-xl border border-emerald-500/20">
                      <div className="flex items-center space-x-4">
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
                        <button className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 hover:bg-emerald-500/30 transition-colors text-sm font-mystical">
                          Compare Charts
                        </button>
                        <button className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-colors text-sm font-mystical">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="section-header text-2xl mb-6">Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 font-mystical">Appearance</h3>
                  <div className="flex items-center justify-between p-4 glass-morphism rounded-xl border border-emerald-500/20">
                    <div>
                      <p className="font-medium text-white font-mystical">Theme</p>
                      <p className="text-sm text-gray-300 font-mystical">
                        Choose your preferred visual theme
                      </p>
                    </div>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as 'night' | 'day')}
                      className="form-input"
                    >
                      <option value="night">Night Mode</option>
                      <option value="day">Day Mode</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 font-mystical">Account</h3>
                  <div className="space-y-4">
                    <button className="w-full p-4 glass-morphism rounded-xl border border-emerald-500/20 text-left hover:bg-emerald-500/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white font-mystical">Change Password</p>
                          <p className="text-sm text-gray-300 font-mystical">Update your account password</p>
                        </div>
                        <span className="text-gray-400">→</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full p-4 glass-morphism rounded-xl border border-red-500/20 text-left hover:bg-red-500/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-red-300 font-mystical">Sign Out</p>
                          <p className="text-sm text-gray-300 font-mystical">Log out of your account</p>
                        </div>
                        <span className="text-red-400">→</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 