'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import UserProfile from '../../components/UserProfile';
import Navigation from '../../components/Navigation';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20 text-center">
            <h1 className="section-header text-3xl mb-4">Sign In Required</h1>
            <p className="text-gray-300 font-mystical mb-6">
              Please sign in to access your profile and library
            </p>
            <button className="btn-cosmic px-8 py-3 rounded-xl font-mystical">
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <UserProfile user={user} />
    </>
  );
} 