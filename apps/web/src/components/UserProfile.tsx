'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StripePayment from './StripePayment';

interface UserProfileProps {
  onClose?: () => void;
}

export default function UserProfile({ onClose }: UserProfileProps) {
  const { user, updateProfile, getSavedTracks, getUsage, supabase } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'library' | 'subscription' | 'settings'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedTracks, setSavedTracks] = useState<any[]>([]);
  const [usage, setUsage] = useState<any>(null);
  const [profileForm, setProfileForm] = useState({
    display_name: user?.display_name || '',
    birthData: user?.birthData || {
      date: '',
      time: '',
      latitude: 0,
      longitude: 0,
      timezone: ''
    },
    isPublic: user?.isPublic || false,
    theme: user?.theme || 'night'
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        display_name: user.display_name || '',
        birthData: user.birthData || {
          date: '',
          time: '',
          latitude: 0,
          longitude: 0,
          timezone: ''
        },
        isPublic: user.isPublic || false,
        theme: user.theme || 'night'
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'library') {
      loadSavedTracks();
    } else if (activeTab === 'subscription') {
      loadUsage();
    }
  }, [activeTab]);

  const loadSavedTracks = async () => {
    try {
      const tracks = await getSavedTracks();
      setSavedTracks(tracks);
    } catch (error) {
      console.error('Failed to load saved tracks:', error);
    }
  };

  const loadUsage = async () => {
    try {
      const usageData = await getUsage();
      setUsage(usageData);
    } catch (error) {
      console.error('Failed to load usage:', error);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      await updateProfile(profileForm);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportTrack = async (trackId: string) => {
    if (!user) return;
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astradio.onrender.com';
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) throw new Error('No session');

      const response = await fetch(`${API_BASE}/api/session/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: trackId,
          format: 'json'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Create download link
        const link = document.createElement('a');
        link.href = result.data.download_url;
        link.download = `astradio-track-${trackId}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error('Failed to export track');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to export track');
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (!confirm('Are you sure you want to delete this track?')) return;

    try {
      // This would call the deleteTrack function from AuthContext
      // For now, we'll just remove from local state
      setSavedTracks(prev => prev.filter(track => track.id !== trackId));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete track');
    }
  };

  if (!user) {
    return (
      <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20">
        <h3 className="text-xl font-semibold mb-4 text-emerald-300">User Profile</h3>
        <p className="text-gray-300">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-emerald-300">User Profile</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {[
          { id: 'profile', label: 'Profile', icon: '👤' },
          { id: 'library', label: 'Library', icon: '📚' },
          { id: 'subscription', label: 'Subscription', icon: '💳' },
          { id: 'settings', label: 'Settings', icon: '⚙️' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20">
              <h3 className="text-xl font-semibold mb-4 text-emerald-300">Profile Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.display_name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, display_name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="Enter your display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={user.username}
                    disabled
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={profileForm.isPublic}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 bg-gray-800 border-gray-600 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="isPublic" className="ml-2 text-sm text-gray-300">
                    Make profile public
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Theme
                  </label>
                  <select
                    value={profileForm.theme}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, theme: e.target.value as 'night' | 'day' }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="night">Night Mode</option>
                    <option value="day">Day Mode</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleProfileUpdate}
                disabled={isLoading}
                className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>

            {/* Birth Data Section */}
            <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20">
              <h3 className="text-xl font-semibold mb-4 text-emerald-300">Birth Chart Data</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    value={profileForm.birthData.date}
                    onChange={(e) => setProfileForm(prev => ({ 
                      ...prev, 
                      birthData: { ...prev.birthData, date: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Birth Time
                  </label>
                  <input
                    type="time"
                    value={profileForm.birthData.time}
                    onChange={(e) => setProfileForm(prev => ({ 
                      ...prev, 
                      birthData: { ...prev.birthData, time: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={profileForm.birthData.latitude}
                    onChange={(e) => setProfileForm(prev => ({ 
                      ...prev, 
                      birthData: { ...prev.birthData, latitude: parseFloat(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="40.7128"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={profileForm.birthData.longitude}
                    onChange={(e) => setProfileForm(prev => ({ 
                      ...prev, 
                      birthData: { ...prev.birthData, longitude: parseFloat(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="-74.0060"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20">
              <h3 className="text-xl font-semibold mb-4 text-emerald-300">Your Library</h3>
              
              {savedTracks.length === 0 ? (
                <p className="text-gray-300">No saved tracks yet. Create some music to see them here!</p>
              ) : (
                <div className="space-y-4">
                  {savedTracks.map((track) => (
                    <div key={track.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{track.title}</h4>
                        <p className="text-gray-400 text-sm">
                          {track.chartType} • {track.genre} • {new Date(track.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Plays: {track.playCount} • {track.isPublic ? 'Public' : 'Private'}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleExportTrack(track.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm transition-colors"
                        >
                          Export
                        </button>
                        <button
                          onClick={() => handleDeleteTrack(track.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <StripePayment onSuccess={() => setActiveTab('profile')} />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20">
              <h3 className="text-xl font-semibold mb-4 text-emerald-300">Account Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-300 mb-2">Account Information</h4>
                  <p className="text-gray-400 text-sm">
                    Member since: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Last login: {new Date(user.lastLogin).toLocaleDateString()}
                  </p>
                </div>

                {usage && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-300 mb-2">Usage Statistics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">Chart Generations</p>
                        <p className="text-white font-semibold">{usage.usage?.chartGenerations || 0}</p>
                      </div>
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">Audio Exports</p>
                        <p className="text-white font-semibold">{usage.usage?.exports || 0}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-lg font-medium text-gray-300 mb-2">Danger Zone</h4>
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors">
                    Delete Account
                  </button>
                  <p className="text-gray-400 text-sm mt-2">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="glass-morphism rounded-2xl p-6 border border-red-500/20">
          <p className="text-red-300">❌ {error}</p>
        </div>
      )}
    </div>
  );
} 