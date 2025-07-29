'use client';

import React, { useState } from 'react';
import Navigation from '../../components/Navigation';

interface JamSession {
  id: number;
  name: string;
  description: string;
  participants: number;
  duration: string;
  mood: string;
  planets: string[];
  status: 'Active' | 'Paused' | 'Ended';
}

export default function JamPage() {
  const [isJoining, setIsJoining] = useState(false);
  const [currentSession, setCurrentSession] = useState<JamSession | null>(null);

  const activeSessions: JamSession[] = [
    {
      id: 1,
      name: 'Venus Harmony',
      description: 'Collaborative session focused on love and beauty themes',
      participants: 4,
      duration: '15:32',
      mood: 'Harmonious',
      planets: ['Venus', 'Jupiter'],
      status: 'Active'
    },
    {
      id: 2,
      name: 'Mars Energy',
      description: 'High-energy jamming with passion and drive',
      participants: 3,
      duration: '8:45',
      mood: 'Energetic',
      planets: ['Mars', 'Sun'],
      status: 'Active'
    },
    {
      id: 3,
      name: 'Moon Reflection',
      description: 'Contemplative ambient session with emotional depth',
      participants: 2,
      duration: '22:18',
      mood: 'Contemplative',
      planets: ['Moon', 'Neptune'],
      status: 'Paused'
    }
  ];

  const joinSession = async (session: JamSession) => {
    setIsJoining(true);
    // Simulate joining
    setTimeout(() => {
      setCurrentSession(session);
      setIsJoining(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1c2f] via-[#0f2f1f] to-[#0a1c2f] text-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 leading-[1.2] tracking-tight gradient-text-cosmic cosmic-glow-text">
            Cosmic Jam Sessions
          </h1>
          <p className="text-xl text-gray-300 mb-6 leading-[1.4] tracking-normal">
            Collaborate and create music with others in real-time
          </p>
        </div>

        {/* Create New Session */}
        <div className="glass-morphism-strong rounded-3xl p-8 mb-8 cosmic-glow">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-mystical font-semibold text-cosmic mb-4">
              Start New Jam
            </h2>
            <p className="text-gray-300 mb-6">
              Create a collaborative music session with astrological themes
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-emerald-300 font-medium mb-2">Session Name</label>
                <input 
                  type="text" 
                  placeholder="Enter session name"
                  className="w-full px-4 py-3 glass-morphism-strong rounded-xl border border-emerald-500/20 text-white placeholder-gray-400 focus:border-emerald-500/40 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-emerald-300 font-medium mb-2">Theme</label>
                <select className="w-full px-4 py-3 glass-morphism-strong rounded-xl border border-emerald-500/20 text-white focus:border-emerald-500/40 focus:outline-none">
                  <option>Love & Harmony (Venus)</option>
                  <option>Energy & Drive (Mars)</option>
                  <option>Communication (Mercury)</option>
                  <option>Expansion (Jupiter)</option>
                  <option>Discipline (Saturn)</option>
                  <option>Intuition (Moon)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-emerald-300 font-medium mb-2">Max Participants</label>
                <select className="w-full px-4 py-3 glass-morphism-strong rounded-xl border border-emerald-500/20 text-white focus:border-emerald-500/40 focus:outline-none">
                  <option>2</option>
                  <option>4</option>
                  <option>6</option>
                  <option>8</option>
                  <option>Unlimited</option>
                </select>
              </div>
              
              <div>
                <label className="block text-emerald-300 font-medium mb-2">Privacy</label>
                <select className="w-full px-4 py-3 glass-morphism-strong rounded-xl border border-emerald-500/20 text-white focus:border-emerald-500/40 focus:outline-none">
                  <option>Public</option>
                  <option>Friends Only</option>
                  <option>Private</option>
                </select>
              </div>
            </div>
            
            <button className="btn-cosmic px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105">
              Create Session
            </button>
          </div>
        </div>

        {/* Current Session */}
        {currentSession && (
          <div className="glass-morphism rounded-2xl p-6 mb-8 cosmic-glow">
            <h3 className="text-xl font-mystical font-semibold text-cosmic mb-4">
              Current Session
            </h3>
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-500/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-orange-300">{currentSession.name}</h4>
                <span className={`text-xs px-3 py-1 rounded ${
                  currentSession.status === 'Active' ? 'bg-green-500/20 text-green-300' :
                  currentSession.status === 'Paused' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {currentSession.status}
                </span>
              </div>
              <p className="text-gray-300 mb-4">{currentSession.description}</p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-orange-300 text-sm font-medium">Participants:</span>
                  <span className="text-gray-300 text-sm ml-2">{currentSession.participants}</span>
                </div>
                <div>
                  <span className="text-orange-300 text-sm font-medium">Duration:</span>
                  <span className="text-gray-300 text-sm ml-2">{currentSession.duration}</span>
                </div>
                <div>
                  <span className="text-orange-300 text-sm font-medium">Mood:</span>
                  <span className="text-gray-300 text-sm ml-2">{currentSession.mood}</span>
                </div>
                <div>
                  <span className="text-orange-300 text-sm font-medium">Planets:</span>
                  <span className="text-gray-300 text-sm ml-2">{currentSession.planets.join(', ')}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="btn-cosmic px-4 py-2 rounded-lg text-sm font-medium">
                  {currentSession.status === 'Active' ? 'Pause' : 'Resume'}
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-orange-300 transition-colors border border-orange-500/30">
                  Invite
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-orange-300 transition-colors border border-orange-500/30">
                  Leave
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Sessions */}
        <div className="glass-morphism rounded-2xl p-6">
          <h3 className="text-xl font-mystical font-semibold text-cosmic mb-6">
            Active Sessions
          </h3>
          
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div key={session.id} className="glass-morphism-strong rounded-xl p-4 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-emerald-300">{session.name}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">{session.duration}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      session.status === 'Active' ? 'bg-green-500/20 text-green-300' :
                      session.status === 'Paused' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                </div>
                <p className="text-gray-300 mb-3">{session.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-300 text-sm font-medium">{session.mood}</span>
                    <span className="text-gray-400 text-sm">{session.participants} participants</span>
                    <div className="flex space-x-1">
                      {session.planets.map((planet, index) => (
                        <span key={index} className="text-xs bg-emerald-500/20 px-2 py-1 rounded text-emerald-300">
                          {planet}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => joinSession(session)}
                      disabled={isJoining}
                      className="btn-cosmic px-3 py-1 rounded text-xs font-medium disabled:opacity-50"
                    >
                      {isJoining ? 'Joining...' : 'Join'}
                    </button>
                    <button className="px-3 py-1 rounded text-xs font-medium text-gray-400 hover:text-emerald-300 transition-colors">
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jam Stats */}
        <div className="glass-morphism rounded-2xl p-6 mt-8">
          <h3 className="text-xl font-mystical font-semibold text-cosmic mb-6">
            Jam Statistics
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 glass-morphism-strong rounded-xl border border-emerald-500/20">
              <div className="text-3xl font-bold text-emerald-300 mb-2">12</div>
              <div className="text-gray-400 text-sm">Active Sessions</div>
            </div>
            
            <div className="text-center p-4 glass-morphism-strong rounded-xl border border-emerald-500/20">
              <div className="text-3xl font-bold text-emerald-300 mb-2">47</div>
              <div className="text-gray-400 text-sm">Total Participants</div>
            </div>
            
            <div className="text-center p-4 glass-morphism-strong rounded-xl border border-emerald-500/20">
              <div className="text-3xl font-bold text-emerald-300 mb-2">2.3h</div>
              <div className="text-gray-400 text-sm">Average Duration</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 