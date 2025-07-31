'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '../context/SubscriptionContext';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumUpgradeModal({ isOpen, onClose }: PremiumUpgradeModalProps) {
  const { upgradeToPremium, isLoading } = useSubscription();

  const handleUpgrade = async () => {
    try {
      await upgradeToPremium();
      onClose();
    } catch (error) {
      console.error('Failed to upgrade:', error);
    }
  };

  const features = [
    {
      title: 'Expanded Compositions',
      description: '30 seconds per house instead of 5 seconds',
      icon: '🎼'
    },
    {
      title: 'Unlimited Library',
      description: 'Save unlimited tracks to your personal library',
      icon: '📚'
    },
    {
      title: 'Priority Support',
      description: 'Get help when you need it most',
      icon: '🎧'
    },
    {
      title: 'Advanced Analytics',
      description: 'Track your musical journey and patterns',
      icon: '📊'
    }
  ];

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
            className="glass-morphism-strong rounded-2xl p-8 w-full max-w-2xl border border-emerald-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">✨</div>
              <h2 className="section-header text-3xl mb-2">Upgrade to Premium</h2>
              <p className="text-gray-300 font-mystical">
                Unlock the full potential of your astrological compositions
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-morphism rounded-xl p-6 border border-emerald-500/20"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{feature.icon}</div>
                    <div>
                      <h3 className="font-semibold text-white font-mystical mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-300 font-mystical">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Duration Comparison */}
            <div className="glass-morphism rounded-xl p-6 border border-violet-500/20 mb-8">
              <h3 className="section-header text-xl mb-4">Composition Duration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400 mb-2">Free</div>
                  <div className="text-3xl font-bold text-gray-300 mb-1">5s</div>
                  <div className="text-sm text-gray-400">per house</div>
                  <div className="text-lg font-bold text-gray-300 mt-2">1 minute total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-300 mb-2">Premium</div>
                  <div className="text-3xl font-bold text-emerald-300 mb-1">30s</div>
                  <div className="text-sm text-emerald-300">per house</div>
                  <div className="text-lg font-bold text-emerald-300 mt-2">6 minutes total</div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="text-center mb-8">
              <div className="text-4xl font-bold text-emerald-300 mb-2">$9.99</div>
              <div className="text-gray-300 font-mystical">per month</div>
              <div className="text-sm text-gray-400 mt-2">Cancel anytime</div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="flex-1 btn-cosmic py-4 rounded-xl font-mystical disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Upgrading...
                  </div>
                ) : (
                  'Upgrade Now'
                )}
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-6 py-4 bg-gray-600/20 border border-gray-600/30 rounded-xl text-gray-300 hover:bg-gray-600/30 font-mystical"
              >
                Maybe Later
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 