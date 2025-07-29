'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navigation from '../../components/Navigation';
import BirthDataForm from '../../components/BirthDataForm';
import ChartDisplay from '../../components/ChartDisplay';
import AudioVisualizer from '../../components/AudioVisualizer';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorDisplay from '../../components/ErrorDisplay';
import { AstroChart, AudioStatus } from '../../types';

interface JamSession {
  id: string;
  hostId: string;
  participants: string[];
  chartData: AstroChart;
  isActive: boolean;
  createdAt: Date;
}

export default function JamSessionPage() {
  const [chart, setChart] = useState<AstroChart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jamSession, setJamSession] = useState<JamSession | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>({
    isPlaying: false,
    isLoading: false,
    currentSession: null,
    error: null
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
  const wsRef = useRef<WebSocket | null>(null);

  // Mock WebSocket connection for jam session
  useEffect(() => {
    // In a real implementation, this would connect to a WebSocket server
            console.log('Jam session: Mock WebSocket connection established');
    
    // Simulate participants joining
    setTimeout(() => {
      setParticipants(['user1', 'user2']);
    }, 2000);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleFormSubmit = async (formData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const birthData = {
        date: formData.date,
        time: formData.time,
        latitude: formData.latitude,
        longitude: formData.longitude,
        timezone: formData.timezone || 0
      };

      const response = await fetch(`${API_BASE}/api/charts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birth_data: birthData,
          mode: 'jam'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setChart(data.data.chart);
        
        // Create jam session
        const session: JamSession = {
          id: `jam_${Date.now()}`,
          hostId: 'current_user',
          participants: ['current_user'],
          chartData: data.data.chart,
          isActive: true,
          createdAt: new Date()
        };
        
        setJamSession(session);
        setIsHost(true);
      } else {
        throw new Error(data.error || 'Failed to generate chart');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const startJamSession = async () => {
    if (!chart) return;

    setAudioStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(`${API_BASE}/api/audio/sequential`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chart_data: chart,
          mode: 'jam'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAudioStatus(prev => ({
          ...prev,
          isPlaying: true,
          isLoading: false,
          currentSession: data.data.session,
          error: null
        }));
      } else {
        throw new Error(data.error || 'Failed to start jam session');
      }
    } catch (error) {
      setAudioStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  const joinJamSession = (sessionId: string) => {
    // Mock joining a jam session
            console.log(`Joining jam session: ${sessionId}`);
    setIsHost(false);
    // In real implementation, this would connect to the session
  };

  const shareSession = () => {
    if (jamSession) {
      const shareUrl = `${window.location.origin}/jam/${jamSession.id}`;
      navigator.clipboard.writeText(shareUrl);
      alert('Jam session link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 leading-[1.2] tracking-tight">Jam Sessions</h1>
          <p className="text-xl text-gray-300 mb-6 leading-[1.4] tracking-normal">
            Create real-time collaborative astrological music experiences
          </p>
        </div>

        {!jamSession ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">Start a New Jam Session</h2>
              <p className="text-gray-300 mb-6">
                Generate your birth chart and invite friends to create music together
              </p>
              <BirthDataForm onSubmit={handleFormSubmit} />
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Join Existing Session</h2>
              <p className="text-gray-300 mb-4">
                Enter a session ID to join someone else's jam
              </p>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Session ID"
                  className="flex-1 px-4 py-2 bg-white/20 rounded-lg border border-white/30 text-white placeholder-gray-400"
                />
                <button
                  onClick={() => joinJamSession('mock_session_id')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Jam Session Header */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-semibold">Active Jam Session</h2>
                  <p className="text-gray-300">Session ID: {jamSession.id}</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={shareSession}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                  >
                    Share Session
                  </button>
                  <button
                    onClick={startJamSession}
                    disabled={audioStatus.isLoading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
                  >
                    {audioStatus.isLoading ? 'Starting...' : 'Start Jam'}
                  </button>
                </div>
              </div>

              {/* Participants */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Participants ({participants.length})</h3>
                <div className="flex gap-2">
                  {participants.map((participant, index) => (
                    <div
                      key={participant}
                      className="px-3 py-1 bg-white/20 rounded-full text-sm"
                    >
                      {participant === 'current_user' ? 'You' : `User ${index + 1}`}
                      {participant === 'current_user' && isHost && ' (Host)'}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart Display */}
            {chart && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Birth Chart</h3>
                  <ChartDisplay chart={chart} />
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 leading-[1.25] tracking-tight">Audio Visualization</h3>
                  <AudioVisualizer 
                    session={audioStatus.currentSession}
                    mode="jam"
                    isPlaying={audioStatus.isPlaying}
                  />
                </div>
              </div>
            )}

            {/* Jam Controls */}
            {audioStatus.isPlaying && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mt-6">
                <h3 className="text-xl font-semibold mb-4">Jam Controls</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
                    Lead Melody
                  </button>
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors">
                    Harmony
                  </button>
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors">
                    Rhythm
                  </button>
                  <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-colors">
                    Effects
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {isLoading && <LoadingSpinner />}
        {error && <ErrorDisplay error={error} />}
      </div>
    </div>
  );
} 