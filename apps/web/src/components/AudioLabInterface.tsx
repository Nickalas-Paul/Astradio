'use client';

import React, { useState, useEffect } from 'react';
import BirthDataForm from './BirthDataForm';
import BlankChartWheel from './BlankChartWheel';
import UnifiedAstrologicalWheel from './UnifiedAstrologicalWheel';
import UnifiedAudioControls from './UnifiedAudioControls';
import GenreDropdown from './GenreDropdown';
import { FormData, AstroChart, AudioStatus } from '../types';
import { buildSecureAPIUrl, clientRateLimiter } from '../lib/security';
import toneAudioService from '../lib/toneAudioService';

interface ChartData {
  chart: AstroChart | null;
  mode: 'birth' | 'transit' | 'sandbox';
  formData?: FormData;
}

interface AudioLabInterfaceProps {
  onStateChange: (state: any) => void;
  state: any;
}

export default function AudioLabInterface({ onStateChange, state }: AudioLabInterfaceProps) {
  const [userLevel, setUserLevel] = useState<'new' | 'returning' | 'power'>('new');
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);

  // Progressive disclosure based on user level
  const getInterfaceForLevel = () => {
    switch (userLevel) {
      case 'new':
        return <NewUserInterface />;
      case 'returning':
        return <ReturningUserInterface />;
      case 'power':
        return <PowerUserInterface />;
      default:
        return <NewUserInterface />;
    }
  };

  // New User Interface - Simple birth chart only
  const NewUserInterface = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-emerald-300 mb-2">Start Simple</h2>
        <p className="text-gray-300">Enter your birth details to hear your personal astrological soundtrack</p>
      </div>

      <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20">
        <BirthDataForm
          onSubmit={handleChartAFormSubmit}
          isLoading={state.isGenerating}
          initialData={state.chartA.formData}
        />
      </div>

      {state.chartA.chart && (
        <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20">
          <h3 className="text-lg font-semibold mb-4 text-emerald-300">Your Birth Chart</h3>
          <div className="flex justify-center">
            <UnifiedAstrologicalWheel
              planets={state.chartA.chart.planets || []}
              aspects={state.chartA.chart.aspects || []}
              size={300}
              isPlaying={state.audioStatus.isPlaying}
              currentHouse={1}
              showHighlight={false}
            />
          </div>
        </div>
      )}

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setUserLevel('returning')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
        >
          Want to compare charts?
        </button>
      </div>
    </div>
  );

  // Returning User Interface - Birth chart + comparison
  const ReturningUserInterface = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-emerald-300 mb-2">Compare & Explore</h2>
        <p className="text-gray-300">Compare your birth chart with today's transits or another person's chart</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A */}
        <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20">
          <h3 className="text-lg font-semibold mb-4 text-emerald-300">Your Birth Chart</h3>
          <BirthDataForm
            onSubmit={handleChartAFormSubmit}
            isLoading={state.isGenerating}
            initialData={state.chartA.formData}
          />
          {state.chartA.chart && (
            <div className="mt-4">
              <UnifiedAstrologicalWheel
                planets={state.chartA.chart.planets || []}
                aspects={state.chartA.chart.aspects || []}
                size={250}
                isPlaying={state.audioStatus.isPlaying}
                currentHouse={1}
                showHighlight={false}
              />
            </div>
          )}
        </div>

        {/* Chart B */}
        <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-emerald-300">Comparison Chart</h3>
            <button
              onClick={() => onStateChange({ ...state, showChartB: !state.showChartB })}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                state.showChartB
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {state.showChartB ? 'Hide' : 'Show'}
            </button>
          </div>

          {state.showChartB && (
            <>
              <div className="space-y-3 mb-4">
                <button
                  onClick={() => handleChartBModeChange('transit')}
                  className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                    state.chartB.mode === 'transit'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Today's Transits
                </button>
                <button
                  onClick={() => handleChartBModeChange('birth')}
                  className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                    state.chartB.mode === 'birth'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Another Birth Chart
                </button>
              </div>

              {state.chartB.mode === 'birth' ? (
                <BirthDataForm
                  onSubmit={handleChartBFormSubmit}
                  isLoading={state.isGenerating}
                  initialData={state.chartB.formData}
                />
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-300">Today's planetary positions will be loaded automatically</p>
                </div>
              )}

              {state.chartB.chart && (
                <div className="mt-4">
                  <UnifiedAstrologicalWheel
                    planets={state.chartB.chart.planets || []}
                    aspects={state.chartB.chart.aspects || []}
                    size={250}
                    isPlaying={state.audioStatus.isPlaying}
                    currentHouse={1}
                    showHighlight={false}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setUserLevel('new')}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors"
        >
          Back to Simple
        </button>
        <button
          onClick={() => setUserLevel('power')}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
        >
          Advanced Controls
        </button>
      </div>
    </div>
  );

  // Power User Interface - Full control panel
  const PowerUserInterface = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-emerald-300 mb-2">Advanced Audio Lab</h2>
        <p className="text-gray-300">Full control over chart modes, sandbox manipulation, and audio generation</p>
      </div>

      {/* Advanced Control Panel */}
      <div className="glass-morphism-strong rounded-2xl p-6 border border-emerald-500/20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Chart A Controls */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-emerald-300">Chart A</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleChartAModeChange('birth')}
                className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                  state.chartA.mode === 'birth'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Birth Chart
              </button>
              <button
                onClick={() => handleChartAModeChange('sandbox')}
                className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                  state.chartA.mode === 'sandbox'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Sandbox
              </button>
            </div>
          </div>

          {/* Chart B Controls */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-emerald-300">Chart B</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleChartBModeChange('transit')}
                className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                  state.chartB.mode === 'transit'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Today's Transits
              </button>
              <button
                onClick={() => handleChartBModeChange('birth')}
                className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                  state.chartB.mode === 'birth'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Birth Chart
              </button>
              <button
                onClick={() => handleChartBModeChange('sandbox')}
                className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                  state.chartB.mode === 'sandbox'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Sandbox
              </button>
            </div>
          </div>

          {/* Genre Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-emerald-300">Genre</h3>
            <GenreDropdown
              selectedGenre={state.selectedGenre || 'ambient'}
              onGenreChange={handleGenreChange}
              disabled={state.isGenerating}
            />
          </div>

          {/* Generate Button */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-emerald-300">Generate</h3>
            <button
              onClick={handleGenerateAudio}
              disabled={!canGenerateAudio || state.audioStatus.isLoading}
              className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
                canGenerateAudio && !state.audioStatus.isLoading
                  ? 'btn-cosmic hover:scale-105'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {state.audioStatus.isLoading ? 'Generating...' : 'Generate Audio'}
            </button>
          </div>
        </div>
      </div>

      {/* Charts Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart A */}
        <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20">
          <h3 className="text-xl font-semibold mb-4 text-emerald-300">
            Chart A - {state.chartA.mode === 'birth' ? 'Birth Chart' : 'Sandbox'}
          </h3>
          
          {state.chartA.mode === 'birth' ? (
            <BirthDataForm
              onSubmit={handleChartAFormSubmit}
              isLoading={state.isGenerating}
              initialData={state.chartA.formData}
            />
          ) : (
            <BlankChartWheel
              onChartUpdate={(chart) => handleSandboxUpdate(chart, 'A')}
              initialChart={state.chartA.chart}
            />
          )}

          {state.chartA.chart && (
            <div className="mt-6">
              <UnifiedAstrologicalWheel
                planets={state.chartA.chart.planets || []}
                aspects={state.chartA.chart.aspects || []}
                size={300}
                isPlaying={state.audioStatus.isPlaying}
                currentHouse={1}
                showHighlight={false}
              />
            </div>
          )}
        </div>

        {/* Chart B */}
        <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-emerald-300">
              Chart B - {state.chartB.mode === 'transit' ? 'Today\'s Transits' : 
                         state.chartB.mode === 'birth' ? 'Birth Chart' : 'Sandbox'}
            </h3>
            <button
              onClick={() => onStateChange({ ...state, showChartB: !state.showChartB })}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                state.showChartB
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {state.showChartB ? 'Hide' : 'Show'}
            </button>
          </div>

          {state.showChartB && (
            <>
              {state.chartB.mode === 'birth' ? (
                <BirthDataForm
                  onSubmit={handleChartBFormSubmit}
                  isLoading={state.isGenerating}
                  initialData={state.chartB.formData}
                />
              ) : (
                <BlankChartWheel
                  onChartUpdate={(chart) => handleSandboxUpdate(chart, 'B')}
                  initialChart={state.chartB.chart}
                />
              )}

              {state.chartB.chart && (
                <div className="mt-6">
                  <UnifiedAstrologicalWheel
                    planets={state.chartB.chart.planets || []}
                    aspects={state.chartB.chart.aspects || []}
                    size={300}
                    isPlaying={state.audioStatus.isPlaying}
                    currentHouse={1}
                    showHighlight={false}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setUserLevel('returning')}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors"
        >
          Back to Comparison
        </button>
      </div>
    </div>
  );

  // Handler functions
  const handleChartAModeChange = (mode: 'birth' | 'sandbox') => {
    onStateChange({
      ...state,
      chartA: { ...state.chartA, mode, chart: null, formData: undefined }
    });
  };

  const handleChartBModeChange = (mode: 'transit' | 'birth' | 'sandbox') => {
    onStateChange({
      ...state,
      chartB: { ...state.chartB, mode, chart: null, formData: undefined }
    });

    if (mode === 'transit' && !state.chartB.chart) {
      loadTodayTransits();
    }
  };

  const handleChartAFormSubmit = async (formData: FormData) => {
    onStateChange({ ...state, isGenerating: true, error: null });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/charts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birth_data: formData,
          mode: state.chartA.mode
        }),
      });

      const data = await response.json();

      if (data.success) {
        onStateChange({
          ...state,
          chartA: {
            ...state.chartA,
            chart: data.data.chart,
            formData
          },
          isGenerating: false
        });
      } else {
        throw new Error(data.error || 'Failed to generate chart');
      }
    } catch (error) {
      onStateChange({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to generate chart',
        isGenerating: false
      });
    }
  };

  const handleChartBFormSubmit = async (formData: FormData) => {
    onStateChange({ ...state, isGenerating: true, error: null });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/charts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birth_data: formData,
          mode: state.chartB.mode
        }),
      });

      const data = await response.json();

      if (data.success) {
        onStateChange({
          ...state,
          chartB: {
            ...state.chartB,
            chart: data.data.chart,
            formData
          },
          isGenerating: false
        });
      } else {
        throw new Error(data.error || 'Failed to generate chart');
      }
    } catch (error) {
      onStateChange({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to generate chart',
        isGenerating: false
      });
    }
  };

  const handleSandboxUpdate = (chart: AstroChart, chartType: 'A' | 'B') => {
    if (chartType === 'A') {
      onStateChange({
        ...state,
        chartA: { ...state.chartA, chart }
      });
    } else {
      onStateChange({
        ...state,
        chartB: { ...state.chartB, chart }
      });
    }
  };

  const handleGenreChange = (newGenre: string) => {
    onStateChange({ ...state, selectedGenre: newGenre });
  };

  const handleGenerateAudio = async () => {
    if (!state.chartA.chart) {
      onStateChange({ ...state, error: 'Chart A is required for audio generation' });
      return;
    }

    onStateChange({
      ...state,
      audioStatus: { ...state.audioStatus, isLoading: true, error: null }
    });

    try {
      let audioResponse;

      if (state.chartB.chart) {
        // Generate overlay composition
        const overlayBody = {
          chart1_data: state.chartA.chart,
          chart2_data: state.chartB.chart,
          configuration: {
            tempo: 140,
            duration: 90,
            volume: 0.8,
            reverb: 0.3
          },
          mode: 'overlay'
        };

        audioResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/audio/overlay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(overlayBody),
        });
      } else {
        // Generate solo composition
        const soloBody = {
          chart_data: state.chartA.chart,
          mode: state.chartA.mode
        };

        audioResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/audio/sequential`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(soloBody),
        });
      }

      const audioData = await audioResponse.json();

      if (audioData.success) {
        onStateChange({
          ...state,
          audioStatus: {
            ...state.audioStatus,
            isLoading: false,
            currentSession: audioData.data.session
          }
        });
      } else {
        throw new Error(audioData.error || 'Failed to generate audio');
      }
    } catch (error) {
      onStateChange({
        ...state,
        audioStatus: {
          ...state.audioStatus,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to generate audio'
        }
      });
    }
  };

  const loadTodayTransits = async () => {
    try {
      if (!clientRateLimiter.canMakeRequest('daily')) {
        console.warn('Rate limit exceeded for daily chart request');
        return;
      }
      
      const today = new Date().toISOString().split('T')[0];
      const apiUrl = buildSecureAPIUrl(`daily/${today}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        onStateChange({
          ...state,
          chartB: {
            ...state.chartB,
            chart: data.data.chart,
            mode: 'transit'
          }
        });
      }
    } catch (error) {
      console.error('Failed to load today\'s transits:', error);
      onStateChange({ ...state, error: 'Failed to load today\'s transits' });
    }
  };

  const canGenerateAudio = state.chartA.chart && !state.isGenerating;

  return (
    <div>
      {getInterfaceForLevel()}
      
      {/* Audio Controls (when available) */}
      {state.audioStatus.currentSession && (
        <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20 mt-6">
          <h3 className="text-xl font-semibold mb-4 text-emerald-300">Audio Controls</h3>
          <UnifiedAudioControls
            chartData={state.chartA.chart!}
            genre={state.selectedGenre || 'ambient'}
            mode={state.chartB.chart ? 'overlay' : 'moments'}
            onPlay={() => {
              toneAudioService.play();
              onStateChange({
                ...state,
                audioStatus: { ...state.audioStatus, isPlaying: true }
              });
            }}
            onStop={() => {
              toneAudioService.stop();
              onStateChange({
                ...state,
                audioStatus: { ...state.audioStatus, isPlaying: false }
              });
            }}
            onPause={() => {
              toneAudioService.pause();
              onStateChange({
                ...state,
                audioStatus: { ...state.audioStatus, isPlaying: false }
              });
            }}
            showExport={true}
          />
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="glass-morphism rounded-2xl p-6 border border-red-500/20 mt-6">
          <p className="text-red-300">❌ {state.error}</p>
        </div>
      )}
    </div>
  );
} 