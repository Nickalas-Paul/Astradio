"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swissEphemerisService_1 = __importDefault(require("../services/swissEphemerisService"));
const astroCore_1 = require("../core/astroCore");
const uuid_1 = require("uuid");
class DailyChartController {
    constructor() {
        this.swissEphService = new swissEphemerisService_1.default();
        this.musicEngine = new astroCore_1.AstroMusicEngine();
    }
    async generateDailyChart(req, res) {
        try {
            const requestData = req.body;
            // Use provided date or default to today
            const date = requestData.date ? new Date(requestData.date) : new Date();
            // Use provided location or default to Greenwich
            const location = requestData.location || {
                latitude: 51.4769,
                longitude: 0.0005,
                timezone: 0
            };
            console.log('📅 Generating daily chart for:', date.toISOString(), 'at location:', location);
            // Calculate planetary positions
            const planets = await this.swissEphService.calculatePlanetaryPositions(date, location.latitude, location.longitude, location.timezone);
            // Calculate house cusps
            const houses = await this.swissEphService.calculateHouseCusps(date, location.latitude, location.longitude, location.timezone);
            // Calculate aspects
            const aspects = this.swissEphService.calculateAspects(planets);
            // Create astrological chart
            const chart = this.swissEphService.convertToAstroChart(planets, houses, aspects, { date: date.toISOString(), time: date.toTimeString() });
            console.log('🌟 Chart generated with planets:', Object.keys(planets));
            // Get genre from query params or default to ambient
            const genre = req.query.genre || 'ambient';
            // Convert chart to audio configuration
            const { audioConfig, planetMappings } = this.musicEngine.convertChartToAudio(chart, genre);
            console.log('🎵 Audio config generated:', {
                genre: audioConfig.genre,
                tempo: audioConfig.tempo,
                key: audioConfig.key,
                scale: audioConfig.scale,
                duration: audioConfig.duration
            });
            console.log('🎶 Planet mappings generated:', planetMappings.length, 'mappings');
            const response = {
                chart,
                audio_config: audioConfig,
                planet_mappings: planetMappings,
                track_id: (0, uuid_1.v4)()
            };
            res.json(response);
        }
        catch (error) {
            console.error('❌ Error generating daily chart:', error);
            res.status(500).json({
                error: 'Failed to generate daily chart',
                message: error instanceof Error ? error.message : 'Unknown error',
                details: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    async getChartForDate(req, res) {
        try {
            const { date } = req.params;
            const { latitude, longitude, timezone, genre } = req.query;
            const targetDate = new Date(date);
            if (isNaN(targetDate.getTime())) {
                res.status(400).json({ error: 'Invalid date format' });
                return;
            }
            const location = {
                latitude: latitude ? parseFloat(latitude) : 51.4769,
                longitude: longitude ? parseFloat(longitude) : 0.0005,
                timezone: timezone ? parseInt(timezone) : 0
            };
            const requestData = {
                date: targetDate.toISOString(),
                location
            };
            // Reuse the main generation logic
            req.body = requestData;
            req.query.genre = genre;
            await this.generateDailyChart(req, res);
        }
        catch (error) {
            console.error('❌ Error getting chart for date:', error);
            res.status(500).json({
                error: 'Failed to get chart for date',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async getAvailableGenres(req, res) {
        try {
            const genres = [
                {
                    id: 'ambient',
                    name: 'Ambient',
                    description: 'Ethereal, spacious soundscapes perfect for meditation',
                    tempo_range: '60-80 BPM',
                    characteristics: ['Reverb-heavy', 'Drone elements', 'Minimal rhythm']
                },
                {
                    id: 'techno',
                    name: 'Techno',
                    description: 'Driving electronic beats with synthetic textures',
                    tempo_range: '120-140 BPM',
                    characteristics: ['Four-on-the-floor', 'Synthesized', 'Hypnotic']
                },
                {
                    id: 'world',
                    name: 'World Music',
                    description: 'Organic instruments with global influences',
                    tempo_range: '80-110 BPM',
                    characteristics: ['Natural timbres', 'Modal scales', 'Cultural fusion']
                },
                {
                    id: 'hip-hop',
                    name: 'Hip-Hop',
                    description: 'Rhythmic beats with urban energy',
                    tempo_range: '80-100 BPM',
                    characteristics: ['Strong backbeat', 'Sampled elements', 'Groove-focused']
                }
            ];
            res.json({ genres });
        }
        catch (error) {
            console.error('❌ Error getting available genres:', error);
            res.status(500).json({
                error: 'Failed to get available genres',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async getSwissEphStatus(req, res) {
        try {
            const isAvailable = this.swissEphService.getMode() === 'native';
            res.json({
                swiss_ephemeris_available: isAvailable,
                calculation_method: isAvailable ? 'swiss_ephemeris' : 'simplified',
                message: isAvailable
                    ? 'Using full Swiss Ephemeris calculations for maximum accuracy'
                    : 'Using simplified calculations - install Visual Studio Build Tools for full Swiss Ephemeris support'
            });
        }
        catch (error) {
            console.error('❌ Error getting Swiss Ephemeris status:', error);
            res.status(500).json({
                error: 'Failed to get Swiss Ephemeris status',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.default = DailyChartController;
//# sourceMappingURL=dailyChartController.js.map