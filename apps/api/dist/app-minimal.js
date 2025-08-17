"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Basic CORS for Vercel
app.use((0, cors_1.default)({
    origin: [/\.vercel\.app$/, /vercel\.app$/],
    credentials: false
}));
app.use(express_1.default.json());
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});
// Minimal daily chart
app.get('/api/daily/:date', (req, res) => {
    const { date } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }
    res.json({
        success: true,
        data: {
            date,
            chart: { planets: {}, houses: {} },
            events: [],
            generated_at: new Date().toISOString()
        }
    });
});
// Genres
app.get('/api/genres', (req, res) => {
    res.json(['ambient', 'techno', 'world', 'hiphop']);
});
app.get('/api/status', (req, res) => {
    res.json({ swissephAvailable: false, status: 'minimal' });
});
app.listen(PORT, () => {
    console.log(`🎵 Astradio API (Minimal) on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=app-minimal.js.map