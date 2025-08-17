import { z } from 'zod';
export type EphemerisPoint = {
    body: string;
    longitude: number;
    latitude: number;
    speed: number;
};
export type ChartRequest = {
    date?: string;
    lat?: number;
    lon?: number;
    tz?: string;
};
export type NatalChartRequest = {
    birthDate: string;
    birthLat?: number;
    birthLon?: number;
};
export declare function getCurrentEphemerisUTC(req?: ChartRequest): Promise<EphemerisPoint[]>;
export declare function getNatalChart(req: NatalChartRequest): Promise<EphemerisPoint[]>;
export declare function mapChartToMusic(params: {
    ephemeris: EphemerisPoint[];
    genre: "ambient" | "techno" | "world" | "hiphop";
}): {
    tempo: number;
    key: string;
    scale: string;
    layers: {
        instrument: string;
        pattern: string;
    }[];
};
export declare const GenerateRequestSchema: z.ZodObject<{
    genre: z.ZodEnum<["ambient", "techno", "world", "hiphop"]>;
    customEphemeris: z.ZodOptional<z.ZodArray<z.ZodObject<{
        body: z.ZodString;
        longitude: z.ZodNumber;
        latitude: z.ZodNumber;
        speed: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        body: string;
        longitude: number;
        latitude: number;
        speed: number;
    }, {
        body: string;
        longitude: number;
        latitude: number;
        speed: number;
    }>, "many">>;
    natalChart: z.ZodOptional<z.ZodObject<{
        birthDate: z.ZodString;
        birthLat: z.ZodOptional<z.ZodNumber>;
        birthLon: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        birthDate: string;
        birthLat?: number | undefined;
        birthLon?: number | undefined;
    }, {
        birthDate: string;
        birthLat?: number | undefined;
        birthLon?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    genre: "ambient" | "techno" | "world" | "hiphop";
    customEphemeris?: {
        body: string;
        longitude: number;
        latitude: number;
        speed: number;
    }[] | undefined;
    natalChart?: {
        birthDate: string;
        birthLat?: number | undefined;
        birthLon?: number | undefined;
    } | undefined;
}, {
    genre: "ambient" | "techno" | "world" | "hiphop";
    customEphemeris?: {
        body: string;
        longitude: number;
        latitude: number;
        speed: number;
    }[] | undefined;
    natalChart?: {
        birthDate: string;
        birthLat?: number | undefined;
        birthLon?: number | undefined;
    } | undefined;
}>;
