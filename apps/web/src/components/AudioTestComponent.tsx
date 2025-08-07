import React, { useState, useEffect } from 'react';
import getUnifiedAudioController from '../lib/unifiedAudioController';

export default function AudioTestComponent() {
  const [audioStatus, setAudioStatus] = useState<any>({
    isLoading: false,
    isPlaying: false,
    error: null,
    currentTime: 0,
    duration: 0,
    mode: null
  });
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    // Only initialize on client side
    if (typeof window === 'undefined') return;
    
    const audioController = getUnifiedAudioController();
    
    audioController.onStatusChangeCallback((status) => {
      setAudioStatus(status);
      console.log('🎵 Audio status updated:', status);
    });

    return () => {
      audioController.destroy();
    };
  }, []);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testDailyAudio = async () => {
    try {
      addTestResult('Testing daily audio via API...');
      const audioController = getUnifiedAudioController();
      const success = await audioController.playDailyAudio('ambient', 30);
      
      if (success) {
        addTestResult('✅ Daily audio started successfully');
      } else {
        addTestResult('❌ Daily audio failed to start');
      }
    } catch (error) {
      addTestResult(`❌ Daily audio error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testChartAudio = async () => {
    try {
      addTestResult('Testing chart audio via real-time generation...');
      const audioController = getUnifiedAudioController();
      
      // Create a simple test chart
      const testChart = {
        planets: {
          Sun: { longitude: 120, sign: { name: 'Leo', degree: 0 }, house: 5, retrograde: false },
          Moon: { longitude: 30, sign: { name: 'Aries', degree: 0 }, house: 2, retrograde: false },
          Mercury: { longitude: 150, sign: { name: 'Virgo', degree: 0 }, house: 6, retrograde: false }
        },
        houses: {
          '1': { cusp_longitude: 0, sign: { name: 'Aries', degree: 0 } },
          '2': { cusp_longitude: 30, sign: { name: 'Taurus', degree: 0 } }
        }
      };
      
      const success = await audioController.playChartAudio(testChart, 'ambient');
      
      if (success) {
        addTestResult('✅ Chart audio started successfully');
      } else {
        addTestResult('❌ Chart audio failed to start');
      }
    } catch (error) {
      addTestResult(`❌ Chart audio error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const stopAudio = () => {
    const audioController = getUnifiedAudioController();
    audioController.stop();
    addTestResult('⏹️ Audio stopped');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-8 border border-emerald-500/20 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Audio Pipeline Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={testDailyAudio}
          disabled={audioStatus.isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white font-medium"
        >
          Test Daily Audio (API)
        </button>
        
        <button
          onClick={testChartAudio}
          disabled={audioStatus.isLoading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-white font-medium"
        >
          Test Chart Audio (Real-time)
        </button>
        
        <button
          onClick={stopAudio}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium"
        >
          Stop Audio
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Audio Status</h3>
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Loading:</span>
              <span className={`ml-2 ${audioStatus.isLoading ? 'text-yellow-400' : 'text-green-400'}`}>
                {audioStatus.isLoading ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Playing:</span>
              <span className={`ml-2 ${audioStatus.isPlaying ? 'text-green-400' : 'text-red-400'}`}>
                {audioStatus.isPlaying ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Mode:</span>
              <span className="ml-2 text-blue-400">{audioStatus.mode || 'None'}</span>
            </div>
            <div>
              <span className="text-slate-400">Duration:</span>
              <span className="ml-2 text-blue-400">{audioStatus.duration.toFixed(1)}s</span>
            </div>
            <div>
              <span className="text-slate-400">Current Time:</span>
              <span className="ml-2 text-blue-400">{audioStatus.currentTime.toFixed(1)}s</span>
            </div>
            {audioStatus.error && (
              <div className="col-span-2">
                <span className="text-slate-400">Error:</span>
                <span className="ml-2 text-red-400">{audioStatus.error}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-white">Test Results</h3>
          <button
            onClick={clearResults}
            className="px-3 py-1 bg-slate-600 hover:bg-slate-700 rounded text-white text-sm"
          >
            Clear
          </button>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 max-h-64 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-slate-400 text-sm">No test results yet. Click a test button to start.</p>
          ) : (
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 