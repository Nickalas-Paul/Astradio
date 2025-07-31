'use client';

import React, { useState } from 'react';
import { NoteEvent } from '../lib/toneAudioService';

interface ExportControlsProps {
  chart: any;
  noteEvents: NoteEvent[];
  genre: string;
  mode: 'daily' | 'personal' | 'overlay' | 'sandbox';
  title?: string;
  className?: string;
}

interface ExportData {
  chart: any;
  noteEvents: NoteEvent[];
  genre: string;
  mode: string;
  timestamp: string;
  title?: string;
  metadata: {
    totalNotes: number;
    duration: number;
    planets: string[];
    aspects: any[];
  };
}

export default function ExportControls({ 
  chart, 
  noteEvents, 
  genre, 
  mode, 
  title,
  className = ''
}: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'wav' | 'mid' | 'json'>('wav');

  const generateExportData = (): ExportData => {
    const metadata = {
      totalNotes: noteEvents.length,
      duration: noteEvents.reduce((total, event) => Math.max(total, event.startTime + event.duration), 0),
      planets: chart?.planets ? Object.keys(chart.planets) : [],
      aspects: chart?.aspects || []
    };

    return {
      chart,
      noteEvents,
      genre,
      mode,
      timestamp: new Date().toISOString(),
      title: title || `${mode} composition`,
      metadata
    };
  };

  const exportAsJSON = () => {
    const exportData = generateExportData();
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `astradio-${mode}-${Date.now()}.json`;
    link.click();
  };

  const exportAsMIDI = () => {
    // Convert note events to MIDI format
    const midiData = {
      header: {
        format: 1,
        numTracks: 1,
        timeDivision: 480
      },
      tracks: [{
        name: `${mode} composition`,
        notes: noteEvents.map(event => ({
          note: Math.round(12 * Math.log2(event.pitch / 440) + 69), // Convert frequency to MIDI note
          velocity: Math.round((event.velocity || 0.7) * 127),
          duration: Math.round(event.duration * 480), // Convert to MIDI ticks
          time: Math.round(event.startTime * 480)
        }))
      }]
    };

    const midiStr = JSON.stringify(midiData, null, 2);
    const dataBlob = new Blob([midiStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `astradio-${mode}-${Date.now()}.mid.json`;
    link.click();
  };

  const exportAsWAV = async () => {
    setIsExporting(true);
    
    try {
      // Create a simple WAV file from note events
      // This is a basic implementation - in production you'd want a proper WAV encoder
      const sampleRate = 44100;
      const duration = noteEvents.reduce((total, event) => Math.max(total, event.startTime + event.duration), 0);
      const samples = Math.ceil(duration * sampleRate);
      
      // Create a simple sine wave for each note
      const audioBuffer = new ArrayBuffer(44 + samples * 2); // WAV header + 16-bit samples
      const view = new DataView(audioBuffer);
      
      // WAV header
      view.setUint32(0, 0x52494646, false); // "RIFF"
      view.setUint32(4, 36 + samples * 2, true); // File size
      view.setUint32(8, 0x57415645, false); // "WAVE"
      view.setUint32(12, 0x666D7420, false); // "fmt "
      view.setUint32(16, 16, true); // Chunk size
      view.setUint16(20, 1, true); // Audio format (PCM)
      view.setUint16(22, 1, true); // Channels
      view.setUint32(24, sampleRate, true); // Sample rate
      view.setUint32(28, sampleRate * 2, true); // Byte rate
      view.setUint16(32, 2, true); // Block align
      view.setUint16(34, 16, true); // Bits per sample
      view.setUint32(36, 0x64617461, false); // "data"
      view.setUint32(40, samples * 2, true); // Data size
      
      // Generate audio data (simplified - just sine waves)
      for (let i = 0; i < samples; i++) {
        const time = i / sampleRate;
        let sample = 0;
        
        noteEvents.forEach(event => {
          if (time >= event.startTime && time < event.startTime + event.duration) {
            const frequency = event.pitch;
            const amplitude = (event.volume || 0.7) * 0.3;
            sample += amplitude * Math.sin(2 * Math.PI * frequency * time);
          }
        });
        
        // Clamp and convert to 16-bit
        sample = Math.max(-1, Math.min(1, sample));
        view.setInt16(44 + i * 2, Math.round(sample * 32767), true);
      }
      
      const dataBlob = new Blob([audioBuffer], { type: 'audio/wav' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `astradio-${mode}-${Date.now()}.wav`;
      link.click();
      
    } catch (error) {
      console.error('Failed to export WAV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const saveToLocalStorage = () => {
    const exportData = generateExportData();
    const savedCompositions = JSON.parse(localStorage.getItem('astradio-compositions') || '[]');
    
    const composition = {
      ...exportData,
      id: Date.now(),
      savedAt: new Date().toISOString()
    };
    
    savedCompositions.push(composition);
    localStorage.setItem('astradio-compositions', JSON.stringify(savedCompositions));
    
    // Show success feedback
    const button = document.querySelector('[data-save-button]') as HTMLButtonElement;
    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Saved!';
      button.classList.add('bg-green-600');
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('bg-green-600');
      }, 2000);
    }
  };

  const handleExport = () => {
    switch (exportType) {
      case 'wav':
        exportAsWAV();
        break;
      case 'mid':
        exportAsMIDI();
        break;
      case 'json':
        exportAsJSON();
        break;
    }
  };

  if (!chart || noteEvents.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 ${className}`}>
      <h3 className="text-lg font-semibold mb-3 text-center glow-text">
        💾 Export & Save
      </h3>
      
      <div className="space-y-4">
        {/* Export Type Selection */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-300">Export as:</span>
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value as 'wav' | 'mid' | 'json')}
            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600"
          >
            <option value="wav">WAV Audio</option>
            <option value="mid">MIDI Data</option>
            <option value="json">JSON Project</option>
          </select>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
        >
          {isExporting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Exporting...
            </span>
          ) : (
            `Export as ${exportType.toUpperCase()}`
          )}
        </button>

        {/* Save Button */}
        <button
          onClick={saveToLocalStorage}
          data-save-button
          className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-medium transition-colors"
        >
          💾 Save Composition
        </button>

        {/* Export Info */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>📊 {noteEvents.length} musical events</p>
          <p>🎵 {genre} genre</p>
          <p>⏱️ {Math.round(noteEvents.reduce((total, event) => Math.max(total, event.startTime + event.duration), 0))}s duration</p>
        </div>
      </div>
    </div>
  );
} 