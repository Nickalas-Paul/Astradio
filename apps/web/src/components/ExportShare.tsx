'use client';
import React, { useState } from 'react';
import { AudioSession } from '../types';

interface ExportShareProps {
  session: AudioSession | null;
  className?: string;
}

export default function ExportShare({ session, className = '' }: ExportShareProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

  const handleExport = async () => {
    if (!session) return;

    setIsExporting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/session/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: session.id,
          format: 'json'
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Create download link
        const downloadUrl = `${API_BASE}${data.data.download_url}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `astradio-session-${session.id}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error(data.error || 'Failed to export session');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to export session');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!session) return;

    setIsSharing(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/session/${session.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        const shareUrl = `${window.location.origin}/session/${session.id}`;
        setShareUrl(shareUrl);
        
        // Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
      } else {
        throw new Error(data.error || 'Failed to generate share URL');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to share session');
    } finally {
      setIsSharing(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-center glow-text">
        📤 Export & Share
      </h3>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105"
        >
          {isExporting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Exporting...
            </span>
          ) : (
            '💾 Export Session'
          )}
        </button>
        
        <button
          onClick={handleShare}
          disabled={isSharing}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105"
        >
          {isSharing ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sharing...
            </span>
          ) : (
            '🔗 Share Session'
          )}
        </button>
      </div>

      {shareUrl && (
        <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-300 text-sm mb-2">✅ Share URL copied to clipboard!</p>
          <p className="text-xs text-gray-300 break-all">{shareUrl}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm">❌ {error}</p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400 text-center">
        <p>Session ID: {session.id}</p>
        <p>Mode: {session.configuration.mode}</p>
        <p>Duration: {session.configuration.duration}s</p>
      </div>
    </div>
  );
} 