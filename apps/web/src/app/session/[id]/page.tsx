'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '../../../components/Navigation';
import ChartDisplay from '../../../components/ChartDisplay';
import AudioVisualizer from '../../../components/AudioVisualizer';
import ExportShare from '../../../components/ExportShare';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorDisplay from '../../../components/ErrorDisplay';
import { AudioSession, AstroChart } from '../../../types';

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.id as string;
  
  const [session, setSession] = useState<AudioSession | null>(null);
  const [chart, setChart] = useState<AstroChart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/api/session/${sessionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          setSession(data.data.session);
          setIsPlaying(data.data.session.isPlaying);
          
          // Try to extract chart data from session
          if (data.data.session.chartId) {
            // For now, we'll create a mock chart based on session data
            // In the future, this could be stored with the session
            const mockChart: AstroChart = {
              metadata: {
                conversion_method: 'shared_session',
                ayanamsa_correction: 24,
                birth_datetime: data.data.session.chartId,
                coordinate_system: 'tropical'
              },
              planets: {
                Sun: { longitude: 120, sign: { name: 'Leo', element: 'Fire', modality: 'Fixed', degree: 0 }, house: 5, retrograde: false },
                Moon: { longitude: 30, sign: { name: 'Aries', element: 'Fire', modality: 'Cardinal', degree: 0 }, house: 2, retrograde: false },
                Mercury: { longitude: 150, sign: { name: 'Virgo', element: 'Earth', modality: 'Mutable', degree: 0 }, house: 6, retrograde: false },
                Venus: { longitude: 90, sign: { name: 'Cancer', element: 'Water', modality: 'Cardinal', degree: 0 }, house: 4, retrograde: false },
                Mars: { longitude: 210, sign: { name: 'Libra', element: 'Air', modality: 'Cardinal', degree: 0 }, house: 8, retrograde: false },
                Jupiter: { longitude: 270, sign: { name: 'Capricorn', element: 'Earth', modality: 'Cardinal', degree: 0 }, house: 10, retrograde: false },
                Saturn: { longitude: 330, sign: { name: 'Pisces', element: 'Water', modality: 'Mutable', degree: 0 }, house: 12, retrograde: false }
              },
              houses: {
                '1': { cusp_longitude: 0, sign: { name: 'Aries', element: 'Fire', modality: 'Cardinal', degree: 0 } },
                '2': { cusp_longitude: 30, sign: { name: 'Taurus', element: 'Earth', modality: 'Fixed', degree: 0 } },
                '3': { cusp_longitude: 60, sign: { name: 'Gemini', element: 'Air', modality: 'Mutable', degree: 0 } },
                '4': { cusp_longitude: 90, sign: { name: 'Cancer', element: 'Water', modality: 'Cardinal', degree: 0 } },
                '5': { cusp_longitude: 120, sign: { name: 'Leo', element: 'Fire', modality: 'Fixed', degree: 0 } },
                '6': { cusp_longitude: 150, sign: { name: 'Virgo', element: 'Earth', modality: 'Mutable', degree: 0 } },
                '7': { cusp_longitude: 180, sign: { name: 'Libra', element: 'Air', modality: 'Cardinal', degree: 0 } },
                '8': { cusp_longitude: 210, sign: { name: 'Scorpio', element: 'Water', modality: 'Fixed', degree: 0 } },
                '9': { cusp_longitude: 240, sign: { name: 'Sagittarius', element: 'Fire', modality: 'Mutable', degree: 0 } },
                '10': { cusp_longitude: 270, sign: { name: 'Capricorn', element: 'Earth', modality: 'Cardinal', degree: 0 } },
                '11': { cusp_longitude: 300, sign: { name: 'Aquarius', element: 'Air', modality: 'Fixed', degree: 0 } },
                '12': { cusp_longitude: 330, sign: { name: 'Pisces', element: 'Water', modality: 'Mutable', degree: 0 } }
              }
            };
            setChart(mockChart);
          }
        } else {
          throw new Error(data.error || 'Session not found');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load session');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <LoadingSpinner 
              message="Loading shared session..." 
              size="lg"
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <ErrorDisplay 
              error={error}
              onRetry={() => window.location.reload()}
            />
            <div className="mt-8">
              <Link 
                href="/"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 glow-text">
            Shared Session
          </h1>
          <p className="text-xl text-gray-300">
            Session ID: {sessionId}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            {chart && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-2xl font-bold mb-4 text-center glow-text">
                  Astrological Chart
                </h3>
                <ChartDisplay chart={chart} />
              </div>
            )}
          </div>

          <div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold mb-4 text-center glow-text">
                Audio Visualization
              </h3>
              <AudioVisualizer 
                session={session}
                isPlaying={isPlaying}
                mode={session?.configuration.mode === 'sequential' || session?.configuration.mode === 'layered' ? 'moments' : (session?.configuration.mode as 'moments' | 'overlay' | 'sandbox') || 'moments'}
              />
            </div>
          </div>
        </div>

        {session && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8">
            <h3 className="text-2xl font-bold mb-4 text-center glow-text">
              Session Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="text-lg font-semibold text-purple-300">Mode</div>
                <div className="text-gray-300">{session.configuration.mode}</div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="text-lg font-semibold text-purple-300">Duration</div>
                <div className="text-gray-300">{session.configuration.duration}s</div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="text-lg font-semibold text-purple-300">Status</div>
                <div className="text-gray-300">{isPlaying ? 'Playing' : 'Stopped'}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Link 
            href="/moments"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105"
          >
            Create Your Own
          </Link>
          <Link 
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105"
          >
            Back to Home
          </Link>
        </div>

        {session && (
          <div className="mt-8">
            <ExportShare session={session} />
          </div>
        )}
      </div>
    </div>
  );
} 