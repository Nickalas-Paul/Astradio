import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
export declare const createRateLimit: (windowMs?: number, max?: number) => import("express-rate-limit").RateLimitRequestHandler;
export declare const chartGenerationLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const audioGenerationLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const authLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const exportLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const speedLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const enhancedHelmet: (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
export declare const birthDataSchema: z.ZodObject<{
    date: z.ZodString;
    time: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    timezone: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    date: string;
    latitude: number;
    longitude: number;
    timezone: number;
    time: string;
}, {
    date: string;
    latitude: number;
    longitude: number;
    time: string;
    timezone?: number | undefined;
}>;
export declare const chartGenerationSchema: z.ZodObject<{
    birth_data: z.ZodObject<{
        date: z.ZodString;
        time: z.ZodString;
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
        timezone: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        date: string;
        latitude: number;
        longitude: number;
        timezone: number;
        time: string;
    }, {
        date: string;
        latitude: number;
        longitude: number;
        time: string;
        timezone?: number | undefined;
    }>;
    mode: z.ZodDefault<z.ZodOptional<z.ZodEnum<["moments", "overlay", "sandbox"]>>>;
}, "strip", z.ZodTypeAny, {
    mode: "overlay" | "moments" | "sandbox";
    birth_data: {
        date: string;
        latitude: number;
        longitude: number;
        timezone: number;
        time: string;
    };
}, {
    birth_data: {
        date: string;
        latitude: number;
        longitude: number;
        time: string;
        timezone?: number | undefined;
    };
    mode?: "overlay" | "moments" | "sandbox" | undefined;
}>;
export declare const audioGenerationSchema: z.ZodObject<{
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
export declare const authSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    displayName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    displayName?: string | undefined;
}, {
    email: string;
    password: string;
    displayName?: string | undefined;
}>;
export declare const sessionSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    chart_data: z.ZodAny;
    audio_config: z.ZodOptional<z.ZodAny>;
    narration: z.ZodOptional<z.ZodAny>;
    is_public: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    remix_of_session_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    is_public: boolean;
    chart_data?: any;
    description?: string | undefined;
    audio_config?: any;
    narration?: any;
    tags?: string[] | undefined;
    remix_of_session_id?: string | undefined;
}, {
    title: string;
    chart_data?: any;
    description?: string | undefined;
    audio_config?: any;
    narration?: any;
    is_public?: boolean | undefined;
    tags?: string[] | undefined;
    remix_of_session_id?: string | undefined;
}>;
export declare const validateInput: (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requestSizeLimit: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const securityHeaders: (req: Request, res: Response, next: NextFunction) => void;
export declare const ipWhitelist: (allowedIPs: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const errorHandler: (err: Error & {
    status?: number;
}, req: Request, res: Response, next: NextFunction) => void;
export declare const corsOptions: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void;
    credentials: boolean;
    optionsSuccessStatus: number;
};
//# sourceMappingURL=security.d.ts.map