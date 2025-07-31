'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AstroChart, AudioStatus } from '../types';

interface UnifiedAudioControlsProps {
  chartData: AstroChart;
  genre: string;
  mode: 'moments' | 'overlay' | 'sandbox' | 'melodic';
  onPlay: () => void;
  onStop: () => void;
  onPause: () => void;
  showExport?: boolean;
  audioStatus?: AudioStatus;
  onVolumeChange?: (volume: number) => void;
  onTempoChange?: (tempo: number) => void;
}

export default function UnifiedAudioControls({
  chartData,
  genre,
  mode,
  onPlay,
  onStop,
  onPause,
  showExport = true,
  audioStatus,
  onVolumeChange,
  onTempoChange
}: UnifiedAudioControlsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [tempo, setTempo] = useState(120);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);

  // Real-time audio visualization
  const [audioLevels, setAudioLevels] = useState<number[]>([]);

  useEffect(() => {
    if (audioStatus?.isPlaying) {
      // Simulate audio levels for visualization
      const interval = setInterval(() => {
        setAudioLevels(Array.from({ length: 8 }, () => Math.random() * 0.8 + 0.2));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevels([]);
    }
  }, [audioStatus?.isPlaying]);

  const handleExport = async () => {
    if (!chartData) return;
    
    setIsExporting(true);
    setExportSuccess(false);
    
    try {
      const exportData = {
        chart: chartData,
        mode: mode,
        genre: genre,
        exported_at: new Date().toISOString(),
        configuration: {
          mode: mode,
          genre: genre,
          volume: volume,
          tempo: tempo
        },
        session: audioStatus?.currentSession || null
      };
      
      // Create downloadable JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `astradio-${mode}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!chartData) return;
    
    try {
      const shareData = {
        title: `Astradio ${mode.charAt(0).toUpperCase() + mode.slice(1)} Session`,
        text: `Check out this ${mode} astrological composition!`,
        url: `${window.location.origin}/session/${Date.now()}`
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareData.url);
        alert('Session URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    onVolumeChange?.(newVolume);
  };

  const handleTempoChange = (newTempo: number) => {
    setTempo(newTempo);
    onTempoChange?.(newTempo);
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'overlay': return '🔄';
      case 'sandbox': return '🎛️';
      case 'melodic': return '🎼';
      default: return '🎵';
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'overlay': return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      case 'sandbox': return 'from-emerald-500/20 to-blue-500/20 border-emerald-500/30';
      case 'melodic': return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      default: return 'from-blue-500/20 to-indigo-500/20 border-blue-500/30';
    }
  };

  return (
    <div className={`glass-morphism-strong rounded-2xl p-6 border ${getModeColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getModeIcon()}</span>
          <div>
            <h3 className="text-lg font-semibold text-white capitalize">
              {mode} Mode
            </h3>
            <p className="text-sm text-gray-300">
              {genre} • {Object.keys(chartData.planets || {}).length} planets
            </p>
          </div>
        </div>
        
        {audioStatus && (
          <div className="flex items-center space-x-2">
            {audioStatus.isPlaying && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Playing</span>
              </div>
            )}
            {audioStatus.isLoading && (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-blue-400">Loading</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Audio Visualization */}
      {audioStatus?.isPlaying && audioLevels.length > 0 && (
        <div className="mb-4 flex items-center justify-center space-x-1">
          {audioLevels.map((level, index) => (
            <motion.div
              key={index}
              className="w-1 bg-gradient-to-t from-green-400 to-blue-400 rounded-full"
              style={{ height: `${level * 20}px` }}
              animate={{ height: `${level * 20}px` }}
              transition={{ duration: 0.1 }}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPlay}
          disabled={audioStatus?.isLoading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
        >
          ▶️ Play
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPause}
          disabled={audioStatus?.isLoading}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
        >
          ⏸️ Pause
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStop}
          disabled={audioStatus?.isLoading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
        >
          ⏹️ Stop
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAdvancedControls(!showAdvancedControls)}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors"
        >
          ⚙️ Advanced
        </motion.button>
      </div>

      {/* Advanced Controls */}
      {showAdvancedControls && (
        <div className="mb-4 space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-300">🔊 Volume:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-sm text-gray-300 w-12">{Math.round(volume * 100)}%</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-300">🎵 Tempo:</span>
            <input
              type="range"
              min="60"
              max="200"
              step="5"
              value={tempo}
              onChange={(e) => handleTempoChange(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-sm text-gray-300 w-12">{tempo} BPM</span>
          </div>
        </div>
      )}

      {showExport && (
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                Exporting...
              </>
            ) : (
              '📥 Export'
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
          >
            📤 Share
          </motion.button>
        </div>
      )}

      {exportSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg"
        >
          <p className="text-sm text-green-300 text-center">
            ✅ Session exported successfully!
          </p>
        </motion.div>
      )}

      {audioStatus?.error && (
        <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-300 text-center">
            ❌ {audioStatus.error}
          </p>
        </div>
      )}
    </div>
  );
} 