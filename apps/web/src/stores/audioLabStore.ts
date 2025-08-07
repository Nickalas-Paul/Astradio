import { create } from 'zustand';
import { AstroChart, AudioStatus } from '../types';

type ChartMode = 'generate' | 'overlay' | 'sandbox';
type ViewMode = 'daily' | 'lab';
type ActiveLabMode = 'blank' | 'natal' | 'compare' | 'sandbox';

interface DualChartData {
  chart1: AstroChart | null;
  chart2: AstroChart | null;
}

interface AudioLabState {
  // View management
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // Lab mode management
  activeLabMode: ActiveLabMode;
  setActiveLabMode: (mode: ActiveLabMode) => void;
  
  // Chart data
  charts: DualChartData;
  setCharts: (charts: DualChartData | ((prev: DualChartData) => DualChartData)) => void;
  updateChart: (chartNumber: 1 | 2, chart: AstroChart) => void;
  
  // Audio state
  audioStatus: AudioStatus;
  setAudioStatus: (status: AudioStatus | ((prev: AudioStatus) => AudioStatus)) => void;
  
  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  
  // Overlay specific state
  isMerging: boolean;
  setIsMerging: (merging: boolean) => void;
  mergeComplete: boolean;
  setMergeComplete: (complete: boolean) => void;
  showInterpretation: boolean;
  setShowInterpretation: (show: boolean) => void;
  
  // Sandbox specific state
  sandboxPlanets: any[];
  setSandboxPlanets: (planets: any[]) => void;
  
  // Daily chart state
  dailyChart: AstroChart | null;
  setDailyChart: (chart: AstroChart | null) => void;
  
  // Reset function
  reset: () => void;
  resetToDaily: () => void;
  activateLabMode: () => void;
}

export const useAudioLabStore = create<AudioLabState>((set, get) => ({
  // Initial state
  viewMode: 'daily',
  activeLabMode: 'blank',
  charts: {
    chart1: null,
    chart2: null
  },
  audioStatus: {
    isPlaying: false,
    isLoading: false,
    currentSession: null,
    error: null
  },
  isLoading: false,
  error: null,
  isMerging: false,
  mergeComplete: false,
  showInterpretation: false,
  sandboxPlanets: [],
  dailyChart: null,
  
  // View management
  setViewMode: (mode) => set({ viewMode: mode }),
  
  // Lab mode management
  setActiveLabMode: (mode) => set({ activeLabMode: mode }),
  
  // Chart management
  setCharts: (charts) => {
    if (typeof charts === 'function') {
      set((state) => ({ charts: charts(state.charts) }));
    } else {
      set({ charts });
    }
  },
  updateChart: (chartNumber, chart) => {
    const { charts } = get();
    const key = `chart${chartNumber}` as keyof DualChartData;
    set({
      charts: {
        ...charts,
        [key]: chart
      }
    });
  },
  
  // Audio state management
  setAudioStatus: (status) => {
    if (typeof status === 'function') {
      set((state) => ({ audioStatus: status(state.audioStatus) }));
    } else {
      set({ audioStatus: status });
    }
  },
  
  // UI state management
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  // Overlay state management
  setIsMerging: (merging) => set({ isMerging: merging }),
  setMergeComplete: (complete) => set({ mergeComplete: complete }),
  setShowInterpretation: (show) => set({ showInterpretation: show }),
  
  // Sandbox state management
  setSandboxPlanets: (planets) => set({ sandboxPlanets: planets }),
  
  // Daily chart management
  setDailyChart: (chart) => set({ dailyChart: chart }),
  
  // Reset function
  reset: () => set({
    viewMode: 'daily',
    activeLabMode: 'blank',
    charts: {
      chart1: null,
      chart2: null
    },
    audioStatus: {
      isPlaying: false,
      isLoading: false,
      currentSession: null,
      error: null
    },
    isLoading: false,
    error: null,
    isMerging: false,
    mergeComplete: false,
    showInterpretation: false,
    sandboxPlanets: [],
    dailyChart: null
  }),
  
  // Reset to daily view
  resetToDaily: () => set({
    viewMode: 'daily',
    activeLabMode: 'blank',
    charts: {
      chart1: null,
      chart2: null
    },
    error: null,
    isMerging: false,
    mergeComplete: false,
    showInterpretation: false,
    sandboxPlanets: []
  }),
  
  // Activate lab mode
  activateLabMode: () => set({
    viewMode: 'lab',
    activeLabMode: 'blank',
    charts: {
      chart1: null,
      chart2: null
    },
    error: null,
    isMerging: false,
    mergeComplete: false,
    showInterpretation: false,
    sandboxPlanets: []
  })
})); 