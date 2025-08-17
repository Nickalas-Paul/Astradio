import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
export declare const sanitizeString: (input: string) => string;
export declare const sanitizeBirthData: (data: any) => {
    date: string;
    time: string;
    location: string;
    latitude: number;
    longitude: number;
    timezone: number;
};
export declare const sanitizePrompt: (prompt: string) => string;
export declare const enhancedBirthDataSchema: z.ZodObject<{
    date: z.ZodEffects<z.ZodString, string, string>;
    time: z.ZodString;
    location: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    timezone: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    date: string;
    latitude: number;
    longitude: number;
    timezone: number;
    time: string;
    location: string;
}, {
    date: string;
    latitude: number;
    longitude: number;
    time: string;
    location: string;
    timezone?: number | undefined;
}>;
export declare const enhancedChartGenerationSchema: z.ZodObject<{
    birth_data: z.ZodObject<{
        date: z.ZodEffects<z.ZodString, string, string>;
        time: z.ZodString;
        location: z.ZodString;
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
        timezone: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        date: string;
        latitude: number;
        longitude: number;
        timezone: number;
        time: string;
        location: string;
    }, {
        date: string;
        latitude: number;
        longitude: number;
        time: string;
        location: string;
        timezone?: number | undefined;
    }>;
    mode: z.ZodDefault<z.ZodOptional<z.ZodEnum<["moments", "overlay", "sandbox"]>>>;
    options: z.ZodOptional<z.ZodObject<{
        duration: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        genre: z.ZodOptional<z.ZodString>;
        mood: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        duration: number;
        genre?: string | undefined;
        mood?: string | undefined;
    }, {
        genre?: string | undefined;
        duration?: number | undefined;
        mood?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    mode: "overlay" | "moments" | "sandbox";
    birth_data: {
        date: string;
        latitude: number;
        longitude: number;
        timezone: number;
        time: string;
        location: string;
    };
    options?: {
        duration: number;
        genre?: string | undefined;
        mood?: string | undefined;
    } | undefined;
}, {
    birth_data: {
        date: string;
        latitude: number;
        longitude: number;
        time: string;
        location: string;
        timezone?: number | undefined;
    };
    options?: {
        genre?: string | undefined;
        duration?: number | undefined;
        mood?: string | undefined;
    } | undefined;
    mode?: "overlay" | "moments" | "sandbox" | undefined;
}>;
export declare const enhancedAudioGenerationSchema: z.ZodObject<{
    chart_data: z.ZodObject<{
        metadata: z.ZodObject<{
            birth_datetime: z.ZodString;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            birth_datetime: z.ZodString;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            birth_datetime: z.ZodString;
        }, z.ZodTypeAny, "passthrough">>;
        planets: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        metadata: {
            birth_datetime: string;
        } & {
            [k: string]: unknown;
        };
        planets: Record<string, any>;
    }, {
        metadata: {
            birth_datetime: string;
        } & {
            [k: string]: unknown;
        };
        planets: Record<string, any>;
    }>;
    mode: z.ZodDefault<z.ZodOptional<z.ZodEnum<["moments", "overlay", "sandbox", "melodic", "daily_preview"]>>>;
    duration: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    configuration: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    mode: "overlay" | "melodic" | "moments" | "sandbox" | "daily_preview";
    duration: number;
    chart_data: {
        metadata: {
            birth_datetime: string;
        } & {
            [k: string]: unknown;
        };
        planets: Record<string, any>;
    };
    configuration?: any;
}, {
    chart_data: {
        metadata: {
            birth_datetime: string;
        } & {
            [k: string]: unknown;
        };
        planets: Record<string, any>;
    };
    mode?: "overlay" | "melodic" | "moments" | "sandbox" | "daily_preview" | undefined;
    duration?: number | undefined;
    configuration?: any;
}>;
export declare const sanitizeInput: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateEnhancedInput: (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const preventSQLInjection: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const preventXSS: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const logSuspiciousActivity: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=inputSanitizer.d.ts.map