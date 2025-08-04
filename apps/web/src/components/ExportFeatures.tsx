'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SecurityGate from './SecurityGate';

interface ExportFeaturesProps {
  sessionId: string;
  trackTitle: string;
  chartData: any;
  onExport?: () => void;
}

export default function ExportFeatures({ 
  sessionId, 
  trackTitle, 
  chartData, 
  onExport 
}: ExportFeaturesProps) {
  const { user, supabase } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'wav' | 'mp3'>('json');
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const handleExport = async () => {
    if (!user) return;

    setIsExporting(true);
    setError(null);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) throw new Error('No session');

      const response = await fetch(`${API_BASE}/api/session/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          format: exportFormat,
          metadata: {
            title: trackTitle,
            chartData: chartData,
            exportedAt: new Date().toISOString(),
            exportedBy: user.id
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export track');
      }

      const result = await response.json();
      
      // Create download link
      const link = document.createElement('a');
      link.href = result.data.download_url;
      link.download = `astradio-${trackTitle}-${sessionId}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onExport?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!user) return;

    setIsExporting(true);
    setError(null);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) throw new Error('No session');

      const response = await fetch(`${API_BASE}/api/session/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          title: trackTitle,
          isPublic: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create share link');
      }

      const result = await response.json();
      setShareUrl(result.data.share_url);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Share failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!user) return;

    setIsExporting(true);
    setError(null);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) throw new Error('No session');

      const response = await fetch(`${API_BASE}/api/tracks/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: trackTitle,
          chartType: chartData.type || 'daily',
          genre: chartData.genre || 'ambient',
          chartData: chartData,
          interpretation: chartData.interpretation || '',
          isPublic: false
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save track');
      }

      onExport?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show success message
      const originalText = document.title;
      document.title = 'Copied!';
      setTimeout(() => {
        document.title = originalText;
      }, 1000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20">
        <h3 className="text-xl font-semibold mb-4 text-emerald-300">Export & Share</h3>
        
        <div className="space-y-4">
          {/* Export Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Export Format
            </label>
            <div className="flex space-x-2">
              {[
                { value: 'json', label: 'JSON Data', icon: '📄' },
                { value: 'wav', label: 'WAV Audio', icon: '🎵' },
                { value: 'mp3', label: 'MP3 Audio', icon: '🎶' }
              ].map((format) => (
                <button
                  key={format.value}
                  onClick={() => setExportFormat(format.value as any)}
                  className={`flex-1 py-2 px-3 rounded-lg border transition-all ${
                    exportFormat === format.value
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <span className="mr-2">{format.icon}</span>
                  {format.label}
                </button>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <SecurityGate feature="exports">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
            >
              {isExporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
            </button>
          </SecurityGate>

          {/* Share Button */}
          <button
            onClick={handleShare}
            disabled={isExporting}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
          >
            {isExporting ? 'Creating...' : 'Create Share Link'}
          </button>

          {/* Save to Library */}
          {user && (
            <button
              onClick={handleSaveToLibrary}
              disabled={isExporting}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
            >
              {isExporting ? 'Saving...' : 'Save to Library'}
            </button>
          )}
        </div>

        {/* Share URL Display */}
        {shareUrl && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Share Link</h4>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
              />
              <button
                onClick={() => copyToClipboard(shareUrl)}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Track Information */}
      <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20">
        <h3 className="text-xl font-semibold mb-4 text-emerald-300">Track Information</h3>
        
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-400">Title:</span>
            <p className="text-white">{trackTitle}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-400">Session ID:</span>
            <p className="text-gray-300 font-mono text-sm">{sessionId}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-400">Chart Type:</span>
            <p className="text-white capitalize">{chartData.type || 'daily'}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-400">Genre:</span>
            <p className="text-white capitalize">{chartData.genre || 'ambient'}</p>
          </div>
          
          {chartData.interpretation && (
            <div>
              <span className="text-sm font-medium text-gray-400">Interpretation:</span>
              <p className="text-gray-300 text-sm mt-1">{chartData.interpretation}</p>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="glass-morphism rounded-2xl p-6 border border-red-500/20">
          <p className="text-red-300">❌ {error}</p>
        </div>
      )}

      {/* Usage Information */}
      <div className="glass-morphism rounded-2xl p-6 border border-blue-500/20">
        <h4 className="text-lg font-semibold mb-2 text-blue-300">📊 Export Usage</h4>
        <p className="text-gray-300 text-sm">
          Free plan: 1 export per month • Pro plan: Unlimited exports
        </p>
        <p className="text-gray-300 text-sm mt-1">
          All exports include chart data and audio composition metadata.
        </p>
      </div>
    </div>
  );
} 