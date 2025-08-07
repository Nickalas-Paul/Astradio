import React from 'react';

type LabMode = 'blank' | 'natal' | 'compare' | 'sandbox';

interface AudioLabModeSwitcherProps {
  currentMode: LabMode;
  onModeChange: (mode: LabMode) => void;
  disabled?: boolean;
}

export default function AudioLabModeSwitcher({ 
  currentMode, 
  onModeChange, 
  disabled = false 
}: AudioLabModeSwitcherProps) {
  const modes = [
    {
      id: 'natal' as LabMode,
      label: '🌱 Generate My Chart',
      description: 'Create your natal chart from birth data'
    },
    {
      id: 'compare' as LabMode,
      label: '♻️ Compare/Overlay',
      description: 'Compare your chart with today\'s cosmic energy'
    },
    {
      id: 'sandbox' as LabMode,
      label: '🛠 Sandbox',
      description: 'Drag and drop planets to experiment'
    }
  ];

  return (
    <div className="flex justify-center mb-8">
      <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-2 border border-slate-600/30 shadow-lg">
        <div className="flex space-x-2">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => !disabled && onModeChange(mode.id)}
              disabled={disabled}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 font-sans tracking-wide ${
                currentMode === mode.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md'
                  : 'bg-slate-700/50 text-slate-300 border border-slate-600/30 hover:bg-slate-600/50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={mode.description}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 