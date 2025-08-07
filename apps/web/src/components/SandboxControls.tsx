'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SandboxAudioSession } from '../lib/sandboxAudioService';
import { AstroChart, AspectData } from '../types';

interface SandboxControlsProps {
  chart: AstroChart | null;
  aspects: AspectData[];
  audioConfig: {
    tempo: number;
    duration: number;
    volume: number;
    reverb: number;
    delay: number;
  };
  onReset: () => void;
  onChartUpdate: (chart: AstroChart) => void;
  isAudioPlaying: boolean;
  onAudioStatusChange: (isPlaying: boolean) => void;
}

export default function SandboxControls({
  chart,
  aspects,
  audioConfig,
  onReset,
  onChartUpdate,
  isAudioPlaying,
  onAudioStatusChange
}: SandboxControlsProps) {
  const [sandboxAudioService, setSandboxAudioService] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SandboxAudioSession[]>([]);

  // Initialize sandboxAudioService dynamically
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        const { sandboxAudioService } = await import('../lib/sandboxAudioService');
        setSandboxAudioService(sandboxAudioService);
      } catch (error) {
        console.error('Failed to initialize sandbox audio service:', error);
      }
    };

    initializeAudio();
  }, []);

  const handleExport = async () => {
    if (!chart) return;
    
    setIsExporting(true);
    try {
      await sandboxAudioService.generateAudio(chart, aspects, {
        ...audioConfig,
        genre: 'ambient' // Default genre for sandbox
      });
      await sandboxAudioService.exportAudio(`sandbox_composition_${Date.now()}.wav`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = async () => {
    if (!chart) return;
    
    setIsSaving(true);
    try {
      await sandboxAudioService.generateAudio(chart, aspects, {
        ...audioConfig,
        genre: 'ambient'
      });
      sandboxAudioService.saveSession();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadSessions = () => {
    const sessions = sandboxAudioService.getSavedSessions();
    setSavedSessions(sessions);
    setShowLoadModal(true);
  };

  const handleLoadSession = (session: SandboxAudioSession) => {
    // Restore chart data
    if (session.chartData) {
      onChartUpdate(session.chartData);
    }
    
    // Restore audio session
    sandboxAudioService.loadSession(session.id);
    
    setShowLoadModal(false);
  };

  const handlePlay = async () => {
    if (!chart) return;
    
    try {
      if (!sandboxAudioService.getCurrentSession()) {
        await sandboxAudioService.generateAudio(chart, aspects, {
          ...audioConfig,
          genre: 'ambient'
        });
      }
      await sandboxAudioService.playAudio();
      onAudioStatusChange(true);
    } catch (error) {
      console.error('Play failed:', error);
    }
  };

  const handleStop = () => {
    sandboxAudioService.stopAudio();
    onAudioStatusChange(false);
  };

  const handlePause = () => {
    sandboxAudioService.pauseAudio();
    onAudioStatusChange(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="glass-morphism-strong rounded-2xl p-6 border border-emerald-500/20">
      <h3 className="section-header text-lg mb-6">Sandbox Controls</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Audio Controls */}
        <div className="space-y-2">
          <button
            onClick={handlePlay}
            disabled={!chart || isAudioPlaying}
            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            ▶️ Play
          </button>
          
          <button
            onClick={handleStop}
            disabled={!isAudioPlaying}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            ⏹️ Stop
          </button>
        </div>

        {/* Save/Load Controls */}
        <div className="space-y-2">
          <button
            onClick={handleSave}
            disabled={!chart || isSaving}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            {isSaving ? '💾 Saving...' : '💾 Save'}
          </button>
          
          <button
            onClick={handleLoadSessions}
            className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white font-medium transition-colors"
          >
            📂 Load
          </button>
        </div>

        {/* Export/Reset Controls */}
        <div className="space-y-2">
          <button
            onClick={handleExport}
            disabled={!chart || isExporting}
            className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            {isExporting ? '📤 Exporting...' : '📤 Export'}
          </button>
          
          <button
            onClick={onReset}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors"
          >
            🔄 Reset
          </button>
        </div>

        {/* Status Display */}
        <div className="space-y-2">
          <div className="px-4 py-2 bg-gray-700 rounded-lg text-center">
            <div className="text-sm text-gray-300">Planets</div>
            <div className="text-lg font-bold text-emerald-300">
              {chart?.planets ? Object.keys(chart.planets).length : 0}
            </div>
          </div>
          
          <div className="px-4 py-2 bg-gray-700 rounded-lg text-center">
            <div className="text-sm text-gray-300">Aspects</div>
            <div className="text-lg font-bold text-emerald-300">
              {aspects.length}
            </div>
          </div>
        </div>
      </div>

      {/* Session Info */}
      {sandboxAudioService?.getCurrentSession() && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <h4 className="text-sm font-semibold text-emerald-300 mb-2">Current Session</h4>
          <div className="text-xs text-gray-300 space-y-1">
            <div>Created: {formatDate(sandboxAudioService.getCurrentSession()!.createdAt)}</div>
            <div>Genre: {sandboxAudioService.getCurrentSession()!.config.genre}</div>
            <div>Duration: {sandboxAudioService.getCurrentSession()!.config.duration}s</div>
          </div>
        </div>
      )}

      {/* Load Modal */}
      {showLoadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowLoadModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-morphism-strong rounded-2xl p-6 border border-emerald-500/20 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="section-header text-lg mb-4">Load Saved Session</h3>
            
            {savedSessions.length === 0 ? (
              <p className="text-gray-300 text-center py-8">No saved sessions found</p>
            ) : (
              <div className="space-y-3">
                {savedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/10 cursor-pointer transition-colors"
                    onClick={() => handleLoadSession(session)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-semibold text-emerald-300">
                        Session {session.id.slice(-8)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(session.createdAt)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-300 space-y-1">
                      <div>Planets: {session.chartData?.planets ? Object.keys(session.chartData.planets).length : 0}</div>
                      <div>Aspects: {session.aspects?.length || 0}</div>
                      <div>Genre: {session.config.genre}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowLoadModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
} 