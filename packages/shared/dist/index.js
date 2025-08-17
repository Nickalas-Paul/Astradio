"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateRequestSchema = exports.AudioConfigSchema = exports.ChartInputSchema = void 0;
exports.validateChartInput = validateChartInput;
exports.validateAudioConfig = validateAudioConfig;
exports.validateGenerateRequest = validateGenerateRequest;
const zod_1 = require("zod");
// Zod schemas for validation
exports.ChartInputSchema = zod_1.z.object({
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
    tz: zod_1.z.string(),
    lat: zod_1.z.number().min(-90).max(90),
    lon: zod_1.z.number().min(-180).max(180),
    houseSystem: zod_1.z.enum(['placidus', 'whole']).optional()
});
exports.AudioConfigSchema = zod_1.z.object({
    mode: zod_1.z.enum(['daily', 'natal', 'synastry', 'sandbox']),
    genre: zod_1.z.string().min(1),
    durationSec: zod_1.z.number().min(1).max(300),
    sampleRate: zod_1.z.union([zod_1.z.literal(16000), zod_1.z.literal(22050)]),
    seed: zod_1.z.string().optional()
});
exports.GenerateRequestSchema = zod_1.z.object({
    config: exports.AudioConfigSchema,
    chartA: exports.ChartInputSchema,
    chartB: exports.ChartInputSchema.optional()
});
// Validation functions
function validateChartInput(input) {
    return exports.ChartInputSchema.parse(input);
}
function validateAudioConfig(config) {
    return exports.AudioConfigSchema.parse(config);
}
function validateGenerateRequest(request) {
    return exports.GenerateRequestSchema.parse(request);
}
//# sourceMappingURL=index.js.map