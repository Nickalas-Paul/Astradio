'use client';

import React, { useState } from 'react';
import Navigation from '../../components/Navigation';

interface Experiment {
  id: number;
  name: string;
  description: string;
  parameters: {
    tempo: number;
    key: string;
    mode: string;
    instruments: string[];
  };
  status: 'Ready' | 'Running' | 'Completed' | 'Failed';
  duration: string;
}

export default function SandboxPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(null);

  const experiments: Experiment[] = [
    {
      id: 1,
      name: 'Mercury Retrograde Test',
      description: 'Testing complex communication patterns with dissonant harmonies',
      parameters: {
        tempo: 120,
        key: 'C',
        mode: 'Phrygian',
        instruments: ['Synthesizer', 'Piano', 'Strings']
      },
      status: 'Ready',
      duration: '2:15'
    },
    {
      id: 2,
      name: 'Jupiter Expansion',
      description: 'Exploring optimistic themes with major scales and brass',
      parameters: {
        tempo: 140,
        key: 'G',
        mode: 'Lydian',
        instruments: ['Brass', 'Percussion', 'Bass']
      },
      status: 'Running',
      duration: '3:42'
    },
    {
      id: 3,
      name: 'Saturn Discipline',
      description: 'Structured rhythms with minor keys and woodwinds',
      parameters: {
        tempo: 90,
        key: 'D',
        mode: 'Dorian',
        instruments: ['Woodwinds', 'Piano', 'Drums']
      },
      status: 'Completed',
      duration: '4:08'
    }
  ];

  const runExperiment = async (experiment: Experiment) => {
    setIsRunning(true);
    setCurrentExperiment(experiment);
    
    // Simulate experiment running
    setTimeout(() => {
      setCurrentExperiment({
        ...experiment,
        status: 'Completed'
      });
      setIsRunning(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1c2f] via-[#0f2f1f] to-[#0a1c2f] text-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 leading-[1.2] tracking-tight gradient-text-cosmic cosmic-glow-text">
            Audio Sandbox
          </h1>
          <p className="text-xl text-gray-300 mb-6 leading-[1.4] tracking-normal">
            Experiment with different musical parameters and astrological influences
          </p>
        </div>

        {/* Quick Experiment */}
        <div className="glass-morphism-strong rounded-3xl p-8 mb-8 cosmic-glow">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-mystical font-semibold text-cosmic mb-4">
              Quick Experiment
            </h2>
            <p className="text-gray-300 mb-6">
              Test new musical ideas with custom parameters
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-emerald-300 font-medium mb-2">Tempo (BPM)</label>
                <input 
                  type="range" 
                  min="60" 
                  max="200" 
                  step="5" 
                  defaultValue="120"
                  className="w-full mb-2"
                />
                <span className="text-sm text-gray-400">120 BPM</span>
              </div>
              
              <div>
                <label className="block text-emerald-300 font-medium mb-2">Key</label>
                <select className="w-full px-4 py-3 glass-morphism-strong rounded-xl border border-emerald-500/20 text-white focus:border-emerald-500/40 focus:outline-none">
                  <option>C</option>
                  <option>G</option>
                  <option>D</option>
                  <option>A</option>
                  <option>E</option>
                  <option>B</option>
                  <option>F#</option>
                </select>
              </div>
              
              <div>
                <label className="block text-emerald-300 font-medium mb-2">Mode</label>
                <select className="w-full px-4 py-3 glass-morphism-strong rounded-xl border border-emerald-500/20 text-white focus:border-emerald-500/40 focus:outline-none">
                  <option>Ionian (Major)</option>
                  <option>Dorian</option>
                  <option>Phrygian</option>
                  <option>Lydian</option>
                  <option>Mixolydian</option>
                  <option>Aeolian (Minor)</option>
                  <option>Locrian</option>
                </select>
              </div>
              
              <div>
                <label className="block text-emerald-300 font-medium mb-2">Instruments</label>
                <select className="w-full px-4 py-3 glass-morphism-strong rounded-xl border border-emerald-500/20 text-white focus:border-emerald-500/40 focus:outline-none">
                  <option>Piano</option>
                  <option>Strings</option>
                  <option>Brass</option>
                  <option>Woodwinds</option>
                  <option>Synthesizer</option>
                  <option>Percussion</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={() => runExperiment({
                id: Date.now(),
                name: 'Custom Experiment',
                description: 'User-defined musical parameters',
                parameters: {
                  tempo: 120,
                  key: 'C',
                  mode: 'Ionian',
                  instruments: ['Piano']
                },
                status: 'Ready',
                duration: '2:30'
              })}
              disabled={isRunning}
              className="btn-cosmic px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
            >
              {isRunning ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Running Experiment...
                </span>
              ) : (
                'Run Experiment'
              )}
            </button>
          </div>
        </div>

        {/* Current Experiment */}
        {currentExperiment && (
          <div className="glass-morphism rounded-2xl p-6 mb-8 cosmic-glow">
            <h3 className="text-xl font-mystical font-semibold text-cosmic mb-4">
              Current Experiment
            </h3>
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-purple-300">{currentExperiment.name}</h4>
                <span className={`text-xs px-3 py-1 rounded ${
                  currentExperiment.status === 'Running' ? 'bg-yellow-500/20 text-yellow-300' :
                  currentExperiment.status === 'Completed' ? 'bg-green-500/20 text-green-300' :
                  currentExperiment.status === 'Failed' ? 'bg-red-500/20 text-red-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {currentExperiment.status}
                </span>
              </div>
              <p className="text-gray-300 mb-4">{currentExperiment.description}</p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-purple-300 text-sm font-medium">Tempo:</span>
                  <span className="text-gray-300 text-sm ml-2">{currentExperiment.parameters.tempo} BPM</span>
                </div>
                <div>
                  <span className="text-purple-300 text-sm font-medium">Key:</span>
                  <span className="text-gray-300 text-sm ml-2">{currentExperiment.parameters.key} {currentExperiment.parameters.mode}</span>
                </div>
                <div>
                  <span className="text-purple-300 text-sm font-medium">Instruments:</span>
                  <span className="text-gray-300 text-sm ml-2">{currentExperiment.parameters.instruments.join(', ')}</span>
                </div>
                <div>
                  <span className="text-purple-300 text-sm font-medium">Duration:</span>
                  <span className="text-gray-300 text-sm ml-2">{currentExperiment.duration}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="btn-cosmic px-4 py-2 rounded-lg text-sm font-medium">
                  Play
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-purple-300 transition-colors border border-purple-500/30">
                  Export
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-purple-300 transition-colors border border-purple-500/30">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Experiment Library */}
        <div className="glass-morphism rounded-2xl p-6">
          <h3 className="text-xl font-mystical font-semibold text-cosmic mb-6">
            Experiment Library
          </h3>
          
          <div className="space-y-4">
            {experiments.map((experiment) => (
              <div key={experiment.id} className="glass-morphism-strong rounded-xl p-4 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-emerald-300">{experiment.name}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">{experiment.duration}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      experiment.status === 'Running' ? 'bg-yellow-500/20 text-yellow-300' :
                      experiment.status === 'Completed' ? 'bg-green-500/20 text-green-300' :
                      experiment.status === 'Failed' ? 'bg-red-500/20 text-red-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {experiment.status}
                    </span>
                  </div>
                </div>
                <p className="text-gray-300 mb-3">{experiment.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-300 text-sm font-medium">{experiment.parameters.key} {experiment.parameters.mode}</span>
                    <span className="text-gray-400 text-sm">{experiment.parameters.tempo} BPM</span>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => runExperiment(experiment)}
                      disabled={isRunning}
                      className="btn-cosmic px-3 py-1 rounded text-xs font-medium disabled:opacity-50"
                    >
                      {experiment.status === 'Running' ? 'Running...' : 'Run'}
                    </button>
                    <button className="px-3 py-1 rounded text-xs font-medium text-gray-400 hover:text-emerald-300 transition-colors">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 