'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AstroChart, AudioStatus, AudioSession } from '../types';

type Mode = 'moments' | 'overlay' | 'sandbox';

interface ChartContextType {
  chartData: AstroChart | null;
  mode: Mode;
  audioSession: AudioSession | null;
  setChartData: (chart: AstroChart | null) => void;
  setMode: (mode: Mode) => void;
  setAudioSession: (session: AudioSession | null) => void;
  clearChartData: () => void;
}

const ChartContext = createContext<ChartContextType | undefined>(undefined);

interface ChartProviderProps {
  children: ReactNode;
}

export function ChartProvider({ children }: ChartProviderProps) {
  const [chartData, setChartData] = useState<AstroChart | null>(null);
  const [mode, setMode] = useState<Mode>('moments');
  const [audioSession, setAudioSession] = useState<AudioSession | null>(null);

  const clearChartData = () => {
    setChartData(null);
    setAudioSession(null);
  };

  const value: ChartContextType = {
    chartData,
    mode,
    audioSession,
    setChartData,
    setMode,
    setAudioSession,
    clearChartData
  };

  return (
    <ChartContext.Provider value={value}>
      {children}
    </ChartContext.Provider>
  );
}

export function useChartContext() {
  const context = useContext(ChartContext);
  if (context === undefined) {
    throw new Error('useChartContext must be used within a ChartProvider');
  }
  return context;
} 