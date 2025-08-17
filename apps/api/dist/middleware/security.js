"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = exports.errorHandler = exports.requestLogger = exports.ipWhitelist = exports.securityHeaders = exports.requestSizeLimit = exports.validateInput = exports.sessionSchema = exports.authSchema = exports.audioGenerationSchema = exports.chartGenerationSchema = exports.birthDataSchema = exports.enhancedHelmet = exports.speedLimiter = exports.exportLimit = exports.authLimit = exports.audioGenerationLimit = exports.chartGenerationLimit = exports.createRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_slow_down_1 = __importDefault(require("express-slow-down"));
const helmet_1 = __importDefault(require("helmet"));
const zod_1 = require("zod");
// Rate limiting configuration
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        message: {
            success: false,
            error: 'Too many requests from this IP, please try again later.',
            retryAfter: Math.ceil(windowMs / 1000)
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};
exports.createRateLimit = createRateLimit;
// Specific rate limits for different endpoints
exports.chartGenerationLimit = (0, exports.createRateLimit)(15 * 60 * 1000, 20); // 20 requests per 15 minutes
exports.audioGenerationLimit = (0, exports.createRateLimit)(15 * 60 * 1000, 10); // 10 requests per 15 minutes
exports.authLimit = (0, exports.createRateLimit)(15 * 60 * 1000, 5); // 5 requests per 15 minutes
exports.exportLimit = (0, exports.createRateLimit)(60 * 60 * 1000, 5); // 5 exports per hour
// Slow down configuration
exports.speedLimiter = (0, express_slow_down_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // Allow 50 requests per 15 minutes, then...
    delayMs: () => 500, // Add 500ms delay per request after delayAfter
    validate: { delayMs: false } // Disable validation warning
});
// Enhanced helmet configuration
exports.enhancedHelmet = (0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.astradio.com", "https://astradio.vercel.app", "https://astradio.io", "https://www.astradio.io"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
});
// Input validation schemas using Zod
exports.birthDataSchema = zod_1.z.object({
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    time: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    timezone: zod_1.z.number().optional().default(0)
});
exports.chartGenerationSchema = zod_1.z.object({
    birth_data: exports.birthDataSchema,
    mode: zod_1.z.enum(['moments', 'overlay', 'sandbox']).optional().default('moments')
});
exports.audioGenerationSchema = zod_1.z.object({
    chart_data: zod_1.z.object({
        metadata: zod_1.z.object({
            birth_datetime: zod_1.z.string()
        }).passthrough(),
        planets: zod_1.z.record(zod_1.z.any())
    }),
    mode: zod_1.z.enum(['moments', 'overlay', 'sandbox', 'melodic', 'daily_preview']).optional().default('moments'),
    duration: zod_1.z.number().optional().default(60),
    configuration: zod_1.z.any().optional()
});
exports.authSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    displayName: zod_1.z.string().optional()
});
exports.sessionSchema = zod_1.z.object({
    title: zod_1.z.string().max(100, 'Title too long'),
    description: zod_1.z.string().max(500, 'Description too long').optional(),
    chart_data: zod_1.z.any(),
    audio_config: zod_1.z.any().optional(),
    narration: zod_1.z.any().optional(),
    is_public: zod_1.z.boolean().optional().default(false),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    remix_of_session_id: zod_1.z.string().optional()
});
// Input validation middleware
const validateInput = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.body);
            req.body = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Validation error'
            });
        }
    };
};
exports.validateInput = validateInput;
// Request size limiter
const requestSizeLimit = (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (contentLength > maxSize) {
        return res.status(413).json({
            success: false,
            error: 'Request too large',
            details: 'Maximum request size is 10MB'
        });
    }
    next();
};
exports.requestSizeLimit = requestSizeLimit;
// Security headers middleware
const securityHeaders = (req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Permissions Policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
};
exports.securityHeaders = securityHeaders;
// IP whitelist middleware (for admin endpoints)
const ipWhitelist = (allowedIPs) => {
    return (req, res, next) => {
        const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        if (!allowedIPs.includes(clientIP || '')) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }
        next();
    };
};
exports.ipWhitelist = ipWhitelist;
// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        };
        // Log suspicious requests
        if (res.statusCode >= 400) {
            console.warn('⚠️ Suspicious request:', logData);
        }
        else {
            console.log('📝 Request:', logData);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('🚨 Error:', err);
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(err.status || 500).json({
        success: false,
        error: isDevelopment ? err.message : 'Internal server error',
        ...(isDevelopment && { stack: err.stack })
    });
};
exports.errorHandler = errorHandler;
// CORS configuration
exports.corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'https://astradio.vercel.app',
            'https://astradio-staging.vercel.app',
            'https://astradio.io',
            'https://www.astradio.io'
        ];
        // Allow requests with no origin (like mobile apps, curl requests, or local HTML files)
        if (!origin)
            return callback(null, true);
        // Allow localhost and file:// origins for development
        if (origin.startsWith('file://') || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
            return callback(null, true);
        }
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            console.warn('⚠️ CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};
//# sourceMappingURL=security.js.map