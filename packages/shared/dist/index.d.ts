import { z } from 'zod';
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
export declare const ChartInputSchema: z.ZodObject<{
    date: z.ZodString;
    time: z.ZodString;
    tz: z.ZodString;
    lat: z.ZodNumber;
    lon: z.ZodNumber;
    houseSystem: z.ZodOptional<z.ZodEnum<["placidus", "whole"]>>;
}, "strip", z.ZodTypeAny, {
    date?: string;
    time?: string;
    tz?: string;
    lat?: number;
    lon?: number;
    houseSystem?: "placidus" | "whole";
}, {
    date?: string;
    time?: string;
    tz?: string;
    lat?: number;
    lon?: number;
    houseSystem?: "placidus" | "whole";
}>;
export declare const AudioConfigSchema: z.ZodObject<{
    mode: z.ZodEnum<["daily", "natal", "synastry", "sandbox"]>;
    genre: z.ZodString;
    durationSec: z.ZodNumber;
    sampleRate: z.ZodUnion<[z.ZodLiteral<16000>, z.ZodLiteral<22050>]>;
    seed: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    mode?: "daily" | "natal" | "synastry" | "sandbox";
    genre?: string;
    durationSec?: number;
    sampleRate?: 16000 | 22050;
    seed?: string;
}, {
    mode?: "daily" | "natal" | "synastry" | "sandbox";
    genre?: string;
    durationSec?: number;
    sampleRate?: 16000 | 22050;
    seed?: string;
}>;
export declare const GenerateRequestSchema: z.ZodObject<{
    config: z.ZodObject<{
        mode: z.ZodEnum<["daily", "natal", "synastry", "sandbox"]>;
        genre: z.ZodString;
        durationSec: z.ZodNumber;
        sampleRate: z.ZodUnion<[z.ZodLiteral<16000>, z.ZodLiteral<22050>]>;
        seed: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        mode?: "daily" | "natal" | "synastry" | "sandbox";
        genre?: string;
        durationSec?: number;
        sampleRate?: 16000 | 22050;
        seed?: string;
    }, {
        mode?: "daily" | "natal" | "synastry" | "sandbox";
        genre?: string;
        durationSec?: number;
        sampleRate?: 16000 | 22050;
        seed?: string;
    }>;
    chartA: z.ZodObject<{
        date: z.ZodString;
        time: z.ZodString;
        tz: z.ZodString;
        lat: z.ZodNumber;
        lon: z.ZodNumber;
        houseSystem: z.ZodOptional<z.ZodEnum<["placidus", "whole"]>>;
    }, "strip", z.ZodTypeAny, {
        date?: string;
        time?: string;
        tz?: string;
        lat?: number;
        lon?: number;
        houseSystem?: "placidus" | "whole";
    }, {
        date?: string;
        time?: string;
        tz?: string;
        lat?: number;
        lon?: number;
        houseSystem?: "placidus" | "whole";
    }>;
    chartB: z.ZodOptional<z.ZodObject<{
        date: z.ZodString;
        time: z.ZodString;
        tz: z.ZodString;
        lat: z.ZodNumber;
        lon: z.ZodNumber;
        houseSystem: z.ZodOptional<z.ZodEnum<["placidus", "whole"]>>;
    }, "strip", z.ZodTypeAny, {
        date?: string;
        time?: string;
        tz?: string;
        lat?: number;
        lon?: number;
        houseSystem?: "placidus" | "whole";
    }, {
        date?: string;
        time?: string;
        tz?: string;
        lat?: number;
        lon?: number;
        houseSystem?: "placidus" | "whole";
    }>>;
}, "strip", z.ZodTypeAny, {
    config?: {
        mode?: "daily" | "natal" | "synastry" | "sandbox";
        genre?: string;
        durationSec?: number;
        sampleRate?: 16000 | 22050;
        seed?: string;
    };
    chartA?: {
        date?: string;
        time?: string;
        tz?: string;
        lat?: number;
        lon?: number;
        houseSystem?: "placidus" | "whole";
    };
    chartB?: {
        date?: string;
        time?: string;
        tz?: string;
        lat?: number;
        lon?: number;
        houseSystem?: "placidus" | "whole";
    };
}, {
    config?: {
        mode?: "daily" | "natal" | "synastry" | "sandbox";
        genre?: string;
        durationSec?: number;
        sampleRate?: 16000 | 22050;
        seed?: string;
    };
    chartA?: {
        date?: string;
        time?: string;
        tz?: string;
        lat?: number;
        lon?: number;
        houseSystem?: "placidus" | "whole";
    };
    chartB?: {
        date?: string;
        time?: string;
        tz?: string;
        lat?: number;
        lon?: number;
        houseSystem?: "placidus" | "whole";
    };
}>;
export declare function validateChartInput(input: unknown): ChartInput;
export declare function validateAudioConfig(config: unknown): AudioConfig;
export declare function validateGenerateRequest(request: unknown): GenerateRequest;
//# sourceMappingURL=index.d.ts.map