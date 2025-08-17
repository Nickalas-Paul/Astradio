import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
// Import the app (we'll need to export it from index.ts)
import { app } from '../src/index.js';
describe('API Smoke Tests', () => {
    let server;
    beforeAll(() => {
        server = app.listen(0); // Use port 0 for testing
    });
    afterAll((done) => {
        server.close(done);
    });
    describe('GET /health', () => {
        it('should return 200 and health status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);
            expect(response.body).toHaveProperty('ok', true);
            expect(response.body).toHaveProperty('service', 'astradio-api');
            expect(response.body).toHaveProperty('uptime');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('environment');
        });
    });
    describe('GET /api/ephemeris/today', () => {
        it('should return ephemeris array', async () => {
            const response = await request(app)
                .get('/api/ephemeris/today')
                .expect(200);
            expect(response.body).toHaveProperty('ok', true);
            expect(response.body).toHaveProperty('ephemeris');
            expect(Array.isArray(response.body.ephemeris)).toBe(true);
            expect(response.body.ephemeris.length).toBeGreaterThan(0);
            // Check structure of first ephemeris point
            const firstPoint = response.body.ephemeris[0];
            expect(firstPoint).toHaveProperty('body');
            expect(firstPoint).toHaveProperty('longitude');
            expect(firstPoint).toHaveProperty('latitude');
            expect(firstPoint).toHaveProperty('speed');
            expect(typeof firstPoint.body).toBe('string');
            expect(typeof firstPoint.longitude).toBe('number');
            expect(typeof firstPoint.latitude).toBe('number');
            expect(typeof firstPoint.speed).toBe('number');
        });
    });
    describe('POST /api/audio/generate', () => {
        const genres = ['ambient', 'techno', 'world', 'hip-hop'];
        genres.forEach(genre => {
            it(`should return ok: true for ${genre} genre`, async () => {
                const response = await request(app)
                    .post('/api/audio/generate')
                    .send({ genre })
                    .expect(200);
                expect(response.body).toHaveProperty('ok', true);
                expect(response.body).toHaveProperty('music');
                expect(response.body).toHaveProperty('specVersion', 1);
                expect(response.body).toHaveProperty('timestamp');
                // Check music spec structure
                const music = response.body.music;
                expect(music).toHaveProperty('tempo');
                expect(music).toHaveProperty('key');
                expect(music).toHaveProperty('scale');
                expect(music).toHaveProperty('layers');
                expect(typeof music.tempo).toBe('number');
                expect(typeof music.key).toBe('string');
                expect(typeof music.scale).toBe('string');
                expect(Array.isArray(music.layers)).toBe(true);
                // Check layers structure
                if (music.layers.length > 0) {
                    const layer = music.layers[0];
                    expect(layer).toHaveProperty('instrument');
                    expect(layer).toHaveProperty('pattern');
                    expect(typeof layer.instrument).toBe('string');
                    expect(typeof layer.pattern).toBe('string');
                }
            });
        });
        it('should handle invalid genre gracefully', async () => {
            const response = await request(app)
                .post('/api/audio/generate')
                .send({ genre: 'invalid-genre' })
                .expect(400);
            expect(response.body).toHaveProperty('ok', false);
            expect(response.body).toHaveProperty('error');
        });
        it('should accept custom ephemeris data', async () => {
            const customEphemeris = [
                { body: "Sun", longitude: 143.2, latitude: 0, speed: 0.98 },
                { body: "Moon", longitude: 22.08, latitude: 0, speed: 13.2 }
            ];
            const response = await request(app)
                .post('/api/audio/generate')
                .send({
                genre: 'ambient',
                customEphemeris
            })
                .expect(200);
            expect(response.body).toHaveProperty('ok', true);
            expect(response.body).toHaveProperty('music');
        });
    });
    describe('Error handling', () => {
        it('should return 404 for unknown endpoints', async () => {
            const response = await request(app)
                .get('/api/unknown')
                .expect(404);
            expect(response.body).toHaveProperty('ok', false);
            expect(response.body).toHaveProperty('error', 'Endpoint not found');
        });
    });
});
