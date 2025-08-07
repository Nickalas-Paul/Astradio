'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  username: string;
  display_name?: string;
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
  subscription?: {
    plan: 'free' | 'pro' | 'yearly';
    status: 'active' | 'cancelled' | 'past_due';
    currentPeriodEnd?: string;
  };
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
  userId: string;
}

export interface Friend {
  id: string;
  username: string;
  display_name?: string;
  avatar?: string;
  isPublic: boolean;
  lastActive: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  supabase: SupabaseClient;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  saveTrack: (track: Omit<SavedTrack, 'id' | 'createdAt' | 'playCount' | 'userId'>) => Promise<void>;
  deleteTrack: (trackId: string) => Promise<void>;
  getSavedTracks: () => Promise<SavedTrack[]>;
  addFriend: (friendId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  getFriends: () => Promise<Friend[]>;
  searchUsers: (query: string) => Promise<User[]>;
  checkSubscription: () => Promise<any>;
  getUsage: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize Supabase client with fallback for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        // Skip Supabase auth in development if not configured
        if (supabaseUrl === 'https://placeholder.supabase.co') {
          console.log('Supabase not configured, skipping auth check');
          setIsLoading(false);
          return;
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astradio.onrender.com';
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) return;

      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setUser(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Skip auth in development if not configured
      if (supabaseUrl === 'https://placeholder.supabase.co') {
        console.log('Supabase not configured, skipping login');
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: username,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile in our database
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astradio.onrender.com';
        const response = await fetch(`${API_BASE}/api/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            displayName: username,
          }),
        });

        if (response.ok) {
          await fetchUserProfile(data.user.id);
        }
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astradio.onrender.com';
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) throw new Error('No session');

      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const result = await response.json();
        setUser(result.data);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Profile update failed');
    }
  };

  const saveTrack = async (track: Omit<SavedTrack, 'id' | 'createdAt' | 'playCount' | 'userId'>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astradio.onrender.com';
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) throw new Error('No session');

      const response = await fetch(`${API_BASE}/api/tracks/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(track),
      });

      if (!response.ok) {
        throw new Error('Failed to save track');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to save track');
    }
  };

  const deleteTrack = async (trackId: string) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astradio.onrender.com';
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) throw new Error('No session');

      const response = await fetch(`${API_BASE}/api/tracks/${trackId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete track');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete track');
    }
  };

  const getSavedTracks = async (): Promise<SavedTrack[]> => {
    if (!user) return [];
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astradio.onrender.com';
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) return [];

      const response = await fetch(`${API_BASE}/api/tracks`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch tracks:', error);
      return [];
    }
  };

  const addFriend = async (friendId: string) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astradio.onrender.com';
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) throw new Error('No session');

      const response = await fetch(`${API_BASE}/api/friends/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add friend');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to add friend');
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astradio.onrender.com';
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) throw new Error('No session');

      const response = await fetch(`${API_BASE}/api/friends/remove`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendId }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove friend');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to remove friend');
    }
  };

  const getFriends = async (): Promise<Friend[]> => {
    if (!user) return [];
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astradio.onrender.com';
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) return [];

      const response = await fetch(`${API_BASE}/api/friends`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch friends:', error);
      return [];
    }
  };

  const searchUsers = async (query: string): Promise<User[]> => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astradio.onrender.com';
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) return [];

      const response = await fetch(`${API_BASE}/api/users/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('Failed to search users:', error);
      return [];
    }
  };

  const checkSubscription = async () => {
    if (!user) return null;
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astradio.onrender.com';
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) return null;

      const response = await fetch(`${API_BASE}/api/subscriptions/current`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to check subscription:', error);
      return null;
    }
  };

  const getUsage = async () => {
    if (!user) return null;
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astradio.onrender.com';
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) return null;

      const response = await fetch(`${API_BASE}/api/subscriptions/usage`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to get usage:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      supabase,
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
      checkSubscription,
      getUsage,
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