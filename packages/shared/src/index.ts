import { z } from 'zod';

// Core types
export type ChartInput = {
  date: string;
  time: string;
  tz: string;
  lat: number;
  lon: number;
  houseSystem?: 'placidus' | 'whole';
};

export type PlanetPoint = {
  name: string;
  lon: number;
  latEcl: number;
  speed: number;
};

export type Aspect = {
  a: string;
  b: string;
  angle: number;
  orb: number;
  type: 'conj' | 'opp' | 'trine' | 'square' | 'sextile';
};

export type ChartData = {
  julianDay: number;
  planets: PlanetPoint[];
  houses?: number[];
  aspects: Aspect[];
};

export type AudioConfig = {
  mode: 'daily' | 'natal' | 'synastry' | 'sandbox';
  genre: string;
  durationSec: number;
  sampleRate: 16000 | 22050;
  seed?: string;
};

export type GenerateRequest = {
  config: AudioConfig;
  chartA: ChartInput;
  chartB?: ChartInput;
};

export type GenerateResponse = {
  audioId: string;
  status: 'ready';
};

// Zod schemas for validation
export const ChartInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  tz: z.string(),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  houseSystem: z.enum(['placidus', 'whole']).optional()
});

export const AudioConfigSchema = z.object({
  mode: z.enum(['daily', 'natal', 'synastry', 'sandbox']),
  genre: z.string().min(1),
  durationSec: z.number().min(1).max(300),
  sampleRate: z.union([z.literal(16000), z.literal(22050)]),
  seed: z.string().optional()
});

export const GenerateRequestSchema = z.object({
  config: AudioConfigSchema,
  chartA: ChartInputSchema,
  chartB: ChartInputSchema.optional()
});

// Validation functions
export function validateChartInput(input: unknown): ChartInput {
  return ChartInputSchema.parse(input);
}

export function validateAudioConfig(config: unknown): AudioConfig {
  return AudioConfigSchema.parse(config);
}

export function validateGenerateRequest(request: unknown): GenerateRequest {
  return GenerateRequestSchema.parse(request);
}
