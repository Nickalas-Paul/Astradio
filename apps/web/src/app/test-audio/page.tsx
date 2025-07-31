'use client';

import React, { useState } from 'react';

export default function TestAudioPage() {
  const [testResult, setTestResult] = useState<string>('');

  const testAudioPlayback = async () => {
    try {
      console.log('🎵 Testing audio playback...');
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      await ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.frequency.value = 440;
      gain.gain.value = 0.3;
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 2);
      
      console.log('🎵 Test audio played successfully');
      setTestResult('✅ Test audio played successfully');
      return true;
    } catch (error) {
      console.error('❌ Test audio failed:', error);
      setTestResult(`❌ Test audio failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const testAPIAudio = async () => {
    try {
      console.log('🎵 Testing API audio...');
      const response = await fetch('/api/audio/daily?genre=ambient&duration=30');
      console.log('🎵 API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log('🎵 Blob size:', blob.size, 'bytes');
      
      if (blob.size === 0) {
        throw new Error('Empty audio blob received');
      }
      
      const arrayBuffer = await blob.arrayBuffer();
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      await ctx.resume();
      
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      console.log('🎵 Audio decoded, duration:', audioBuffer.duration);
      
      if (audioBuffer.duration === 0) {
        throw new Error('Audio has zero duration');
      }
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
      
      console.log('🎵 API audio played successfully');
      setTestResult('✅ API audio played successfully');
      return true;
    } catch (error) {
      console.error('❌ API audio failed:', error);
      setTestResult(`❌ API audio failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Audio Test Page</h1>
      
      <div className="space-y-4">
        <button 
          onClick={testAudioPlayback}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Test Basic Audio Playback
        </button>
        
        <button 
          onClick={testAPIAudio}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          Test API Audio Playback
        </button>
        
        <div className="mt-8 p-4 bg-gray-800 rounded">
          <h2 className="text-xl font-bold mb-2">Test Result:</h2>
          <p>{testResult || 'No test run yet'}</p>
        </div>
      </div>
    </div>
  );
} 