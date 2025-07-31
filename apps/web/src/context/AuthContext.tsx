'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  birthData?: {
    date: string;
    time: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  theme: 'night' | 'day';
  isPublic: boolean;
  createdAt: string;
  lastLogin: string;
}

export interface SavedTrack {
  id: string;
  title: string;
  chartType: 'daily' | 'overlay' | 'sandbox';
  genre: string;
  chartData: any;
  interpretation: string;
  createdAt: string;
  isPublic: boolean;
  playCount: number;
}

export interface Friend {
  id: string;
  username: string;
  avatar?: string;
  isPublic: boolean;
  lastActive: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  saveTrack: (track: Omit<SavedTrack, 'id' | 'createdAt' | 'playCount'>) => Promise<void>;
  deleteTrack: (trackId: string) => Promise<void>;
  getSavedTracks: () => SavedTrack[];
  addFriend: (friendId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  getFriends: () => Friend[];
  searchUsers: (query: string) => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data storage (replace with real backend)
  const [savedTracks, setSavedTracks] = useState<SavedTrack[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('astradio-user');
    const savedTracksData = localStorage.getItem('astradio-tracks');
    const savedFriendsData = localStorage.getItem('astradio-friends');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedTracksData) {
      setSavedTracks(JSON.parse(savedTracksData));
    }
    if (savedFriendsData) {
      setFriends(JSON.parse(savedFriendsData));
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock login - replace with real auth
      const mockUser: User = {
        id: 'user_' + Date.now(),
        email,
        username: email.split('@')[0],
        theme: 'night',
        isPublic: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      setUser(mockUser);
      localStorage.setItem('astradio-user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
      // Mock signup - replace with real auth
      const newUser: User = {
        id: 'user_' + Date.now(),
        email,
        username,
        theme: 'night',
        isPublic: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      setUser(newUser);
      localStorage.setItem('astradio-user', JSON.stringify(newUser));
    } catch (error) {
      throw new Error('Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('astradio-user');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('astradio-user', JSON.stringify(updatedUser));
  };

  const saveTrack = async (track: Omit<SavedTrack, 'id' | 'createdAt' | 'playCount'>) => {
    const newTrack: SavedTrack = {
      ...track,
      id: 'track_' + Date.now(),
      createdAt: new Date().toISOString(),
      playCount: 0,
    };

    const updatedTracks = [...savedTracks, newTrack];
    setSavedTracks(updatedTracks);
    localStorage.setItem('astradio-tracks', JSON.stringify(updatedTracks));
  };

  const deleteTrack = async (trackId: string) => {
    const updatedTracks = savedTracks.filter(track => track.id !== trackId);
    setSavedTracks(updatedTracks);
    localStorage.setItem('astradio-tracks', JSON.stringify(updatedTracks));
  };

  const getSavedTracks = () => {
    return savedTracks;
  };

  const addFriend = async (friendId: string) => {
    // Mock friend data - replace with real API
    const mockFriend: Friend = {
      id: friendId,
      username: 'friend_' + friendId.slice(-4),
      isPublic: true,
      lastActive: new Date().toISOString(),
    };

    const updatedFriends = [...friends, mockFriend];
    setFriends(updatedFriends);
    localStorage.setItem('astradio-friends', JSON.stringify(updatedFriends));
  };

  const removeFriend = async (friendId: string) => {
    const updatedFriends = friends.filter(friend => friend.id !== friendId);
    setFriends(updatedFriends);
    localStorage.setItem('astradio-friends', JSON.stringify(updatedFriends));
  };

  const getFriends = () => {
    return friends;
  };

  const searchUsers = async (query: string): Promise<User[]> => {
    // Mock search - replace with real API
    return [
      {
        id: 'user_123',
        email: 'user1@example.com',
        username: 'cosmic_user',
        theme: 'night' as const,
        isPublic: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      },
      {
        id: 'user_456',
        email: 'user2@example.com',
        username: 'astro_music',
        theme: 'day' as const,
        isPublic: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      },
    ].filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      signup,
      logout,
      updateProfile,
      saveTrack,
      deleteTrack,
      getSavedTracks,
      addFriend,
      removeFriend,
      getFriends,
      searchUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 