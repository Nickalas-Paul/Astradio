'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AstroChart } from '../types';

interface ShareTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: {
    id: string;
    title: string;
    chartData: AstroChart;
    genre: string;
    interpretation: string;
    mode: 'daily' | 'overlay' | 'sandbox';
  } | null;
}

interface SharePlatform {
  name: string;
  icon: string;
  color: string;
  url: string;
  shareText: string;
}

const SHARE_PLATFORMS: SharePlatform[] = [
  {
    name: 'Twitter/X',
    icon: '𝕏',
    color: '#000000',
    url: 'https://twitter.com/intent/tweet',
    shareText: 'Here\'s what my chart sounds like today via @astradio_io'
  },
  {
    name: 'Instagram',
    icon: '📷',
    color: '#E4405F',
    url: 'https://www.instagram.com',
    shareText: 'My astrological soundtrack 🎵 via @astradio_io'
  },
  {
    name: 'Threads',
    icon: '🧵',
    color: '#000000',
    url: 'https://www.threads.net',
    shareText: 'Here\'s what my chart sounds like today via @astradio_io'
  },
  {
    name: 'TikTok',
    icon: '🎵',
    color: '#000000',
    url: 'https://www.tiktok.com',
    shareText: 'My astrological soundtrack #astrology #music via @astradio_io'
  }
];

export default function ShareTrackModal({ isOpen, onClose, track }: ShareTrackModalProps) {
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SharePlatform | null>(null);
  const linkRef = useRef<HTMLInputElement>(null);

  // Generate shareable link
  React.useEffect(() => {
    if (track) {
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/share/${track.id}`;
      setShareLink(shareUrl);
    }
  }, [track]);

  const copyToClipboard = async () => {
    if (linkRef.current) {
      try {
        await navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  const shareToPlatform = (platform: SharePlatform) => {
    setSelectedPlatform(platform);
    
    const shareData = {
      title: `${track?.title} - Astradio`,
      text: platform.shareText,
      url: shareLink
    };

    if (navigator.share && platform.name !== 'Instagram' && platform.name !== 'TikTok') {
      navigator.share(shareData);
    } else {
      // Fallback for platforms that don't support Web Share API
      const url = new URL(platform.url);
      url.searchParams.set('text', `${platform.shareText} ${shareLink}`);
      url.searchParams.set('url', shareLink);
      window.open(url.toString(), '_blank');
    }
  };

  const generatePreviewImage = () => {
    // This would generate a canvas/image for social sharing
    // For now, we'll create a simple preview
    return {
      title: track?.title || 'Astrological Track',
      genre: track?.genre || 'ambient',
      mode: track?.mode || 'daily'
    };
  };

  const preview = generatePreviewImage();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-morphism-strong rounded-3xl p-8 max-w-2xl w-full border border-emerald-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-header text-2xl">
                Share Your Track
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview Card */}
            <div className="glass-morphism rounded-2xl p-6 mb-6 border border-emerald-500/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 chart-wheel rounded-full border-2 border-emerald-500/30 flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-violet-500 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white font-mystical">
                    {preview.title}
                  </h3>
                  <p className="text-sm text-emerald-300 font-mystical capitalize">
                    {preview.genre} • {preview.mode} mode
                  </p>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm font-mystical leading-relaxed">
                {track?.interpretation?.substring(0, 120)}...
              </p>
            </div>

            {/* Share Link */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 font-mystical mb-2">
                Share Link
              </label>
              <div className="flex space-x-2">
                <input
                  ref={linkRef}
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 form-input bg-gray-800/50"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded-xl font-mystical text-sm transition-all duration-200 ${
                    copied
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                      : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Social Platforms */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white font-mystical mb-4">
                Share to Social Media
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {SHARE_PLATFORMS.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => shareToPlatform(platform)}
                    className="flex items-center space-x-3 p-4 rounded-xl border border-gray-600/30 hover:border-emerald-500/50 transition-all duration-200 glass-morphism"
                  >
                    <span className="text-2xl">{platform.icon}</span>
                    <span className="font-mystical text-white">{platform.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 font-mystical mb-2">
                Custom Message (Optional)
              </label>
              <textarea
                placeholder="Add your own message to share with your track..."
                className="w-full form-input bg-gray-800/50 h-24 resize-none"
                defaultValue="Here's what my chart sounds like today via @astradio_io"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-600/20 border border-gray-500/30 rounded-xl hover:bg-gray-600/30 transition-all duration-200 font-mystical text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save to library functionality
                  onClose();
                }}
                className="flex-1 px-6 py-3 btn-cosmic rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 glow font-mystical"
              >
                Save to Library
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 