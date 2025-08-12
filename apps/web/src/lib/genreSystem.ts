// src/lib/genreSystem.ts

// --- Single source of truth for allowed genres ---
export const GENRES = [
  'ambient',
  'classical',
  'electronic',
  'jazz',
  'lofi',
  'folk',
  // add/remove keys here only, and mirror in the config below
] as const;

export type GenreType = typeof GENRES[number];

export type Waveform = 'sine' | 'triangle' | 'square' | 'sawtooth';

export interface GenreConfiguration {
  name: GenreType;
  instruments: {
    // keep keys optional so config can be sparse
    melodic?: Waveform[];
    harmonic?: Waveform[];
    bass?: Waveform[];
    pads?: Waveform[];
    percussion?: string[]; // strings for kit names or sample IDs
  };
  tempo?: { min: number; max: number };
  scalePrefs?: string[]; // e.g., ["ionian","dorian","aeolian"]
}

// --- Canonical config map ---
// Use `satisfies` so TS verifies keys == GenreType and value shape == GenreConfiguration.
export const GENRE_CONFIG = {
  ambient: {
    name: 'ambient',
    instruments: {
      pads: ['sine', 'triangle'],
      melodic: ['sine'],
    },
    tempo: { min: 60, max: 80 },
    scalePrefs: ['lydian', 'mixolydian'],
  },
  classical: {
    name: 'classical',
    instruments: {
      harmonic: ['sine', 'triangle'],
      melodic: ['triangle'],
    },
    tempo: { min: 70, max: 120 },
    scalePrefs: ['ionian', 'aeolian'],
  },
  electronic: {
    name: 'electronic',
    instruments: {
      bass: ['sawtooth', 'square'],
      melodic: ['sawtooth'],
      percussion: ['electro-kit'],
    },
    tempo: { min: 100, max: 128 },
    scalePrefs: ['dorian', 'phrygian'],
  },
  jazz: {
    name: 'jazz',
    instruments: {
      melodic: ['triangle', 'sine'],
      harmonic: ['sine'],
      percussion: ['brush-kit'],
    },
    tempo: { min: 90, max: 140 },
    scalePrefs: ['mixolydian', 'dorian', 'lydian'],
  },
  lofi: {
    name: 'lofi',
    instruments: {
      pads: ['sine'],
      melodic: ['triangle'],
      percussion: ['lofi-kit'],
    },
    tempo: { min: 70, max: 90 },
    scalePrefs: ['aeolian', 'dorian'],
  },
  folk: {
    name: 'folk',
    instruments: {
      melodic: ['triangle', 'sine'],
      percussion: ['acoustic-kit'],
    },
    tempo: { min: 80, max: 110 },
    scalePrefs: ['ionian', 'mixolydian'],
  },
} satisfies Record<GenreType, GenreConfiguration>;

// Utility accessors
export function listGenres(): GenreType[] {
  return [...GENRES];
}

export function getGenreConfig(genre: GenreType): GenreConfiguration {
  return GENRE_CONFIG[genre];
} 