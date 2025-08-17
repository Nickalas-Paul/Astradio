"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logSuspiciousActivity = exports.preventXSS = exports.preventSQLInjection = exports.validateEnhancedInput = exports.sanitizeInput = exports.enhancedAudioGenerationSchema = exports.enhancedChartGenerationSchema = exports.enhancedBirthDataSchema = exports.sanitizePrompt = exports.sanitizeBirthData = exports.sanitizeString = void 0;
const zod_1 = require("zod");
// Input sanitization utilities
const sanitizeString = (input) => {
    if (typeof input !== 'string')
        return '';
    return input
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .replace(/data:text\/html/gi, '') // Remove data URLs
        .replace(/vbscript:/gi, '') // Remove VBScript
        .trim()
        .slice(0, 1000); // Limit length
};
exports.sanitizeString = sanitizeString;
// Sanitize birth data
const sanitizeBirthData = (data) => {
    return {
        date: (0, exports.sanitizeString)(data.date || ''),
        time: (0, exports.sanitizeString)(data.time || ''),
        location: (0, exports.sanitizeString)(data.location || ''),
        latitude: typeof data.latitude === 'number' ?
            Math.max(-90, Math.min(90, data.latitude)) : 0,
        longitude: typeof data.longitude === 'number' ?
            Math.max(-180, Math.min(180, data.longitude)) : 0,
        timezone: typeof data.timezone === 'number' ?
            Math.max(-12, Math.min(14, data.timezone)) : 0
    };
};
exports.sanitizeBirthData = sanitizeBirthData;
// Sanitize AI prompt inputs
const sanitizePrompt = (prompt) => {
    return (0, exports.sanitizeString)(prompt)
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .replace(/eval\(/gi, '')
        .replace(/Function\(/gi, '')
        .slice(0, 500); // Limit prompt length
};
exports.sanitizePrompt = sanitizePrompt;
// Enhanced validation schemas
exports.enhancedBirthDataSchema = zod_1.z.object({
    date: zod_1.z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
        .refine((date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime()) &&
            parsed.getFullYear() >= 1900 &&
            parsed.getFullYear() <= 2100;
    }, 'Date must be between 1900 and 2100'),
    time: zod_1.z.string()
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
    location: zod_1.z.string().max(200, 'Location too long'),
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    timezone: zod_1.z.number().min(-12).max(14).optional().default(0)
});
exports.enhancedChartGenerationSchema = zod_1.z.object({
    birth_data: exports.enhancedBirthDataSchema,
    mode: zod_1.z.enum(['moments', 'overlay', 'sandbox']).optional().default('moments'),
    options: zod_1.z.object({
        duration: zod_1.z.number().min(10).max(300).optional().default(60),
        genre: zod_1.z.string().max(50).optional(),
        mood: zod_1.z.string().max(50).optional()
    }).optional()
});
exports.enhancedAudioGenerationSchema = zod_1.z.object({
    chart_data: zod_1.z.object({
        metadata: zod_1.z.object({
            birth_datetime: zod_1.z.string()
        }).passthrough(),
        planets: zod_1.z.record(zod_1.z.any())
    }),
    mode: zod_1.z.enum(['moments', 'overlay', 'sandbox', 'melodic', 'daily_preview']).optional().default('moments'),
    duration: zod_1.z.number().min(10).max(300).optional().default(60),
    configuration: zod_1.z.any().optional()
});
// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    // Sanitize query parameters
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = (0, exports.sanitizeString)(req.query[key]);
            }
        });
    }
    // Sanitize body parameters
    if (req.body) {
        if (typeof req.body === 'object') {
            Object.keys(req.body).forEach(key => {
                if (typeof req.body[key] === 'string') {
                    req.body[key] = (0, exports.sanitizeString)(req.body[key]);
                }
            });
        }
    }
    // Sanitize URL parameters
    if (req.params) {
        Object.keys(req.params).forEach(key => {
            if (typeof req.params[key] === 'string') {
                req.params[key] = (0, exports.sanitizeString)(req.params[key]);
            }
        });
    }
    next();
};
exports.sanitizeInput = sanitizeInput;
// Enhanced validation middleware
const validateEnhancedInput = (schema) => {
    return (req, res, next) => {
        try {
            const dataToValidate = {
                ...req.body,
                ...req.query,
                ...req.params
            };
            const validatedData = schema.parse(dataToValidate);
            // Replace request data with validated data
            req.body = { ...req.body, ...validatedData };
            req.query = { ...req.query, ...validatedData };
            req.params = { ...req.params, ...validatedData };
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid input data',
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
exports.validateEnhancedInput = validateEnhancedInput;
// Prevent SQL injection patterns
const preventSQLInjection = (req, res, next) => {
    const sqlPatterns = [
        /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
        /(\b(or|and)\b\s+\d+\s*=\s*\d+)/i,
        /(\b(union|select)\b.*\b(from|where)\b)/i,
        /(--|\/\*|\*\/)/,
        /(\b(exec|execute|sp_|xp_)\b)/i
    ];
    const checkValue = (value) => {
        if (typeof value === 'string') {
            return sqlPatterns.some(pattern => pattern.test(value));
        }
        return false;
    };
    // Check query parameters
    if (req.query && Object.values(req.query).some(checkValue)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid input detected'
        });
    }
    // Check body parameters
    if (req.body && Object.values(req.body).some(checkValue)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid input detected'
        });
    }
    // Check URL parameters
    if (req.params && Object.values(req.params).some(checkValue)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid input detected'
        });
    }
    next();
};
exports.preventSQLInjection = preventSQLInjection;
// Prevent XSS patterns
const preventXSS = (req, res, next) => {
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
        /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
    ];
    const checkValue = (value) => {
        if (typeof value === 'string') {
            return xssPatterns.some(pattern => pattern.test(value));
        }
        return false;
    };
    // Check all input sources
    const allInputs = { ...req.query, ...req.body, ...req.params };
    if (Object.values(allInputs).some(checkValue)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid input detected'
        });
    }
    next();
};
exports.preventXSS = preventXSS;
// Log suspicious activities
const logSuspiciousActivity = (req, res, next) => {
    const suspiciousPatterns = [
        /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<script\b/gi,
        /eval\(/gi,
        /Function\(/gi
    ];
    const checkSuspicious = (value) => {
        if (typeof value === 'string') {
            return suspiciousPatterns.some(pattern => pattern.test(value));
        }
        return false;
    };
    const allInputs = { ...req.query, ...req.body, ...req.params };
    if (Object.values(allInputs).some(checkSuspicious)) {
        console.warn('🚨 Suspicious activity detected:', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.url,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    }
    next();
};
exports.logSuspiciousActivity = logSuspiciousActivity;
//# sourceMappingURL=inputSanitizer.js.map