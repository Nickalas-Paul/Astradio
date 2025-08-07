'use client';

import React, { useState } from 'react';
import getToneAudioService from '../../lib/toneAudioService';

export default function TestAudioPage() {
  const [status, setStatus] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAudioContext = async () => {
    try {
      addLog('Testing AudioContext...');
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      addLog(`AudioContext state: ${audioContext.state}`);
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        addLog('AudioContext resumed successfully');
      }
      
      setStatus('✅ AudioContext working');
    } catch (error) {
      addLog(`❌ AudioContext error: ${error}`);
      setStatus('❌ AudioContext failed');
    }
  };

  const testToneJS = async () => {
    try {
      addLog('Testing Tone.js...');
      const toneService = getToneAudioService();
      
      // Test with a simple note
      const synth = new (window as any).Tone.Synth().toDestination();
      synth.triggerAttackRelease("C4", "4n");
      
      addLog('Tone.js synth played C4 note');
      setStatus('✅ Tone.js working');
    } catch (error) {
      addLog(`❌ Tone.js error: ${error}`);
      setStatus('❌ Tone.js failed');
    }
  };

  const testAPI = async () => {
    try {
      addLog('Testing API endpoint...');
      
      const response = await fetch('http://localhost:3001/api/audio/sequential', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chart_data: {
            metadata: {
              birth_datetime: '1990-01-01T12:00:00Z'
            },
            planets: {}
          },
          mode: 'moments'
        }),
      });
      
      addLog(`API response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        addLog(`API response: ${JSON.stringify(data).substring(0, 100)}...`);
        setStatus('✅ API working');
      } else {
        throw new Error(`API returned ${response.status}`);
      }
    } catch (error) {
      addLog(`❌ API error: ${error}`);
      setStatus('❌ API failed');
    }
  };

  const testFullAudio = async () => {
    try {
      addLog('Testing full audio pipeline...');
      
      // 1. Test AudioContext
      await testAudioContext();
      
      // 2. Test Tone.js
      await testToneJS();
      
      // 3. Test API
      await testAPI();
      
      setStatus('✅ Full audio pipeline working!');
    } catch (error) {
      addLog(`❌ Full audio error: ${error}`);
      setStatus('❌ Full audio failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🎵 Audio Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={testAudioContext}
            className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Test AudioContext
          </button>
          
          <button
            onClick={testToneJS}
            className="p-4 bg-green-600 hover:bg-green-700 rounded-lg"
          >
            Test Tone.js
          </button>
          
          <button
            onClick={testAPI}
            className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg"
          >
            Test API
          </button>
          
          <button
            onClick={testFullAudio}
            className="p-4 bg-orange-600 hover:bg-orange-700 rounded-lg"
          >
            Test Full Pipeline
          </button>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Status</h2>
          <div className="p-4 bg-gray-800 rounded-lg">
            {status || 'Click a test button to start...'}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Logs</h2>
          <div className="p-4 bg-gray-800 rounded-lg h-64 overflow-y-auto font-mono text-sm">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 