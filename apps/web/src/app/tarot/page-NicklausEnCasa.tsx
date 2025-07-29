'use client';
import React, { useState } from 'react';
import Navigation from '../../components/Navigation';

export default function TarotPage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1c2f] via-[#0f2f1f] to-[#0a1c2f] text-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 leading-[1.2] tracking-tight gradient-text-cosmic cosmic-glow-text">
            Tarot Soundtrack System
          </h1>
          <p className="text-xl text-gray-300 mb-6 leading-[1.4] tracking-normal">
            Coming Soon - Transform your tarot readings into musical experiences
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Coming Soon Card */}
          <div className="glass-morphism-strong rounded-3xl p-8 border border-emerald-500/20 text-center cosmic-glow">
            <div className="text-6xl mb-4 star-twinkle">🔮</div>
            <h2 className="text-3xl font-bold mb-4 leading-[1.2] tracking-tight text-cosmic">
              Under Development
            </h2>
            <p className="text-lg text-gray-300 mb-6 leading-[1.4] tracking-normal">
              The Tarot Soundtrack System is currently in development. This feature will allow you to:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/10">
                <div className="text-2xl mb-2">🎴</div>
                <h3 className="text-xl font-semibold mb-2 leading-[1.25] tracking-tight text-cosmic">Draw Cards</h3>
                <p className="text-gray-300 leading-[1.4] tracking-normal">
                  Select your tarot spread and draw cards to generate unique soundtracks
                </p>
              </div>
              
              <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/10">
                <div className="text-2xl mb-2">🎵</div>
                <h3 className="text-xl font-semibold mb-2 leading-[1.25] tracking-tight text-cosmic">Musical Interpretation</h3>
                <p className="text-gray-300 leading-[1.4] tracking-normal">
                  Each card will have its own musical signature based on its meaning and position
                </p>
              </div>
              
              <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/10">
                <div className="text-2xl mb-2">🎬</div>
                <h3 className="text-xl font-semibold mb-2 leading-[1.25] tracking-tight text-cosmic">Visual Narration</h3>
                <p className="text-gray-300 leading-[1.4] tracking-normal">
                  AI-generated videos that sync with your tarot reading soundtrack
                </p>
              </div>
              
              <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/10">
                <div className="text-2xl mb-2">📤</div>
                <h3 className="text-xl font-semibold mb-2 leading-[1.25] tracking-tight text-cosmic">Share Readings</h3>
                <p className="text-gray-300 leading-[1.4] tracking-normal">
                  Export and share your tarot soundtracks with friends and community
                </p>
              </div>
            </div>

            <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20">
              <h3 className="text-xl font-semibold mb-2 leading-[1.25] tracking-tight text-cosmic">Planned Features</h3>
              <ul className="text-left text-gray-300 space-y-2 leading-[1.4] tracking-normal">
                <li>• 78-card tarot deck with unique musical signatures</li>
                <li>• Multiple spread types (Celtic Cross, Three Card, etc.)</li>
                <li>• Card position affects musical progression</li>
                <li>• Elemental influences (Fire, Earth, Air, Water)</li>
                <li>• Major vs Minor Arcana different musical themes</li>
                <li>• Reversed card interpretations</li>
                <li>• Custom spread creation</li>
                <li>• Reading history and saved soundtracks</li>
              </ul>
            </div>

            <div className="mt-8">
              <button
                onClick={() => setIsLoading(true)}
                disabled={isLoading}
                className="btn-cosmic px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 font-sans text-base leading-none tracking-tight align-middle"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Loading...
                  </span>
                ) : (
                  'Join Waitlist'
                )}
              </button>
            </div>
          </div>

          {/* Tarot Card Preview */}
          <div className="mt-8 glass-morphism rounded-2xl p-6 border border-emerald-500/10">
            <h3 className="text-xl font-semibold mb-4 leading-[1.25] tracking-tight text-cosmic">Sample Tarot Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm leading-[1.25] tracking-normal">
              <div className="glass-morphism-strong rounded-xl p-4 border border-red-500/30">
                <h4 className="font-semibold text-red-300 mb-2 leading-[1.25] tracking-tight">The Fool</h4>
                <p className="text-gray-300 leading-[1.4] tracking-normal">
                  New beginnings, innocence, spontaneity. Musical theme: Upbeat, adventurous melodies.
                </p>
              </div>
              <div className="glass-morphism-strong rounded-xl p-4 border border-blue-500/30">
                <h4 className="font-semibold text-blue-300 mb-2 leading-[1.25] tracking-tight">The Moon</h4>
                <p className="text-gray-300 leading-[1.4] tracking-normal">
                  Intuition, mystery, illusion. Musical theme: Ethereal, dreamy soundscapes.
                </p>
              </div>
              <div className="glass-morphism-strong rounded-xl p-4 border border-green-500/30">
                <h4 className="font-semibold text-green-300 mb-2 leading-[1.25] tracking-tight">The Sun</h4>
                <p className="text-gray-300 leading-[1.4] tracking-normal">
                  Joy, success, vitality. Musical theme: Bright, energetic harmonies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 