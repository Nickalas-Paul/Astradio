"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioEngine = exports.UniversalAudioEngine = exports.planetaryMappings = void 0;
// Node.js compatibility layer for Tone.js
let Tone = null;
try {
    // Only try to require Tone.js if we're in a browser environment
    if (typeof window !== 'undefined') {
        Tone = require('tone');
    }
    else {
        console.warn('Tone.js not available in Node.js environment. Audio features will be simulated.');
    }
}
catch (error) {
    console.warn('Tone.js not available in Node.js environment. Audio features will be simulated.');
}
// Create a mock Tone object for Node.js
if (!Tone) {
    Tone = {
        start: async () => console.log('Mock Tone.js started'),
        context: { state: 'running' },
        Synth: class MockSynth {
            constructor() {
                this.volume = { value: 0 };
            }
            toDestination() { return this; }
            triggerAttackRelease() { console.log('Mock note played'); }
            disconnect() { }
        },
        Event: class MockEvent {
            constructor(callback, time) {
                setTimeout(() => callback(time), time * 1000);
            }
            dispose() { }
        },
        Transport: {
            start: () => console.log('Mock transport started'),
            stop: () => console.log('Mock transport stopped')
        }
    };
}
// Extended planetary mappings with more musical properties
exports.planetaryMappings = {
    // Traditional Planets
    Sun: {
        instrument: 'sawtooth',
        baseFrequency: 264, // C4
        energy: 0.8,
        color: '#FFD700',
        element: 'Fire',
        effect: 'lead'
    },
    Moon: {
        instrument: 'sine',
        baseFrequency: 294, // D4
        energy: 0.4,
        color: '#C0C0C0',
        element: 'Water',
        effect: 'ambient'
    },
    Mercury: {
        instrument: 'square',
        baseFrequency: 392, // G4
        energy: 0.6,
        color: '#87CEEB',
        element: 'Air',
        effect: 'melodic'
    },
    Venus: {
        instrument: 'triangle',
        baseFrequency: 349, // F4
        energy: 0.5,
        color: '#FFB6C1',
        element: 'Earth',
        effect: 'harmonic'
    },
    Mars: {
        instrument: 'sawtooth',
        baseFrequency: 440, // A4
        energy: 0.9,
        color: '#FF6B6B',
        element: 'Fire',
        effect: 'rhythmic'
    },
    Jupiter: {
        instrument: 'sine',
        baseFrequency: 196, // G3
        energy: 0.7,
        color: '#FFD93D',
        element: 'Air',
        effect: 'expansive'
    },
    Saturn: {
        instrument: 'square',
        baseFrequency: 147, // D3
        energy: 0.3,
        color: '#A8A8A8',
        element: 'Earth',
        effect: 'structured'
    }
};
class UniversalAudioEngine {
    constructor() {
        this.synths = new Map();
        this.currentSession = null;
        this.isInitialized = false;
        this.scheduledEvents = [];
    }
    async initialize() {
        if (this.isInitialized)
            return;
        // Ensure audio context is started (required for user interaction)
        try {
            await Tone.start();
            console.log('Audio context started:', Tone.context.state);
        }
        catch (error) {
            console.warn('Audio context start failed:', error);
        }
        this.initializeSynths();
        this.isInitialized = true;
    }
    initializeSynths() {
        Object.keys(exports.planetaryMappings).forEach(planet => {
            const mapping = exports.planetaryMappings[planet];
            const synth = new Tone.Synth({
                oscillator: { type: mapping.instrument },
                envelope: {
                    attack: 0.1,
                    decay: 0.2,
                    sustain: 0.3,
                    release: 0.8
                }
            }).toDestination();
            this.synths.set(planet, synth);
        });
    }
    calculateFrequency(baseFreq, signDegree, house) {
        // Adjust frequency based on sign degree (0-29) and house (1-12)
        const degreeMultiplier = 1 + (signDegree / 30) * 0.5; // 0.5 octave range
        const houseMultiplier = 1 + (house - 1) * 0.1; // House affects pitch slightly
        return baseFreq * degreeMultiplier * houseMultiplier;
    }
    calculateDuration(house, planetEnergy) {
        // House affects duration: higher houses = longer notes
        const baseDuration = 0.5; // 0.5 seconds base
        const houseMultiplier = 1 + (house - 1) * 0.2; // Each house adds 20% duration
        const energyMultiplier = 0.5 + planetEnergy * 0.5; // Energy affects duration
        return baseDuration * houseMultiplier * energyMultiplier;
    }
    calculateVolume(planetEnergy, house) {
        // Energy and house position affect volume
        const baseVolume = -20; // dB
        const energyGain = planetEnergy * 10; // 0-10 dB based on energy
        const houseGain = (house - 1) * 2; // Higher houses slightly louder
        return baseVolume + energyGain + houseGain;
    }
    async generateSequential(chartData) {
        await this.initialize();
        // Clear any existing scheduled events
        this.scheduledEvents.forEach(event => event.dispose());
        this.scheduledEvents = [];
        const sessionId = `seq_${Date.now()}`;
        this.currentSession = {
            id: sessionId,
            chartData,
            audioConfig: { genre: 'ambient', tempo: 120, key: 'C', scale: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], duration: 96 },
            status: 'ready',
            createdAt: new Date().toISOString(),
            chartId: chartData.metadata.birth_datetime,
            configuration: { genre: 'ambient', tempo: 120, key: 'C', scale: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], duration: 96, volume: 0.7, mode: 'sequential' },
            isPlaying: true
        };
        console.log('Generating sequential chart audio...');
        // Schedule planets in order of their house positions
        const planetEntries = Object.entries(chartData.planets);
        planetEntries.sort((a, b) => a[1].house - b[1].house);
        let currentTime = 0;
        planetEntries.forEach(([planetName, planetData]) => {
            const mapping = exports.planetaryMappings[planetName];
            if (!mapping)
                return;
            const synth = this.synths.get(planetName);
            if (!synth)
                return;
            const frequency = this.calculateFrequency(mapping.baseFrequency, planetData.sign.degree, planetData.house);
            const duration = this.calculateDuration(planetData.house, mapping.energy);
            const volume = this.calculateVolume(mapping.energy, planetData.house);
            // Schedule the note
            const event = new Tone.Event((time) => {
                synth.volume.value = volume;
                synth.triggerAttackRelease(frequency, duration, time);
                console.log(`Playing ${planetName} in ${planetData.sign.name} (House ${planetData.house})`);
                console.log(`   Frequency: ${frequency.toFixed(1)}Hz, Duration: ${duration.toFixed(2)}s, Volume: ${volume.toFixed(1)}dB`);
            }, currentTime);
            this.scheduledEvents.push(event);
            currentTime += duration + 0.2; // Add small gap between planets
        });
        // Start the sequence
        Tone.Transport.start();
        // Stop after all planets have played
        const totalDuration = currentTime + 1; // Add 1 second buffer
        setTimeout(() => {
            this.stopAll();
        }, totalDuration * 1000);
        return this.currentSession;
    }
    async generateLayered(chartData) {
        await this.initialize();
        // Clear any existing scheduled events
        this.scheduledEvents.forEach(event => event.dispose());
        this.scheduledEvents = [];
        const sessionId = `layered_${Date.now()}`;
        this.currentSession = {
            id: sessionId,
            chartData,
            audioConfig: { genre: 'ambient', tempo: 120, key: 'C', scale: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], duration: 60 },
            status: 'ready',
            createdAt: new Date().toISOString(),
            chartId: chartData.metadata.birth_datetime,
            configuration: { genre: 'ambient', tempo: 120, key: 'C', scale: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], duration: 60, volume: 0.7, mode: 'layered' },
            isPlaying: true
        };
        console.log('Generating layered chart audio...');
        // Play all planets simultaneously with different volumes and timing
        Object.entries(chartData.planets).forEach(([planetName, planetData]) => {
            const mapping = exports.planetaryMappings[planetName];
            if (!mapping)
                return;
            const synth = this.synths.get(planetName);
            if (!synth)
                return;
            const frequency = this.calculateFrequency(mapping.baseFrequency, planetData.sign.degree, planetData.house);
            const duration = this.calculateDuration(planetData.house, mapping.energy);
            const volume = this.calculateVolume(mapping.energy, planetData.house) - 10; // Quieter for layered
            // Schedule with slight delays based on house position
            const delay = (planetData.house - 1) * 0.5;
            const event = new Tone.Event((time) => {
                synth.volume.value = volume;
                synth.triggerAttackRelease(frequency, duration, time);
                console.log(`Layered: ${planetName} in ${planetData.sign.name} (House ${planetData.house})`);
            }, delay);
            this.scheduledEvents.push(event);
        });
        // Start the sequence
        Tone.Transport.start();
        // Stop after 60 seconds
        setTimeout(() => {
            this.stopAll();
        }, 60000);
        return this.currentSession;
    }
    async generateOverlay(chart1, chart2, config) {
        await this.initialize();
        // Clear any existing scheduled events
        this.scheduledEvents.forEach(event => event.dispose());
        this.scheduledEvents = [];
        const sessionId = `overlay_${Date.now()}`;
        const duration = config?.duration || 120;
        const tempo = config?.tempo || 120;
        this.currentSession = {
            id: sessionId,
            chartData: chart1, // Use first chart as primary
            audioConfig: { genre: config?.genre || 'ambient', tempo, key: 'C', scale: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], duration },
            status: 'ready',
            createdAt: new Date().toISOString(),
            chartId: `${chart1.metadata.birth_datetime}_${chart2.metadata.birth_datetime}`,
            configuration: {
                genre: config?.genre || 'ambient',
                tempo,
                key: 'C',
                scale: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
                duration,
                volume: config?.volume || 0.7,
                mode: 'overlay'
            },
            isPlaying: true
        };
        console.log('Generating overlay audio from two charts...');
        console.log(`   Configuration: ${JSON.stringify(this.currentSession?.configuration)}`);
        console.log(`   Chart 1: ${chart1.metadata.birth_datetime} (${Object.keys(chart1.planets).length} planets)`);
        console.log(`   Chart 2: ${chart2.metadata.birth_datetime} (${Object.keys(chart2.planets).length} planets)`);
        // Calculate time per chart based on tempo
        const timePerChart = duration / 2;
        const tempoMultiplier = tempo / 120; // Adjust timing based on tempo
        // Chart 1 planets (first half)
        let currentTime = 0;
        Object.entries(chart1.planets).forEach(([planetName, planetData]) => {
            const mapping = exports.planetaryMappings[planetName];
            if (!mapping)
                return;
            const synth = this.synths.get(planetName);
            if (!synth)
                return;
            const frequency = this.calculateFrequency(mapping.baseFrequency, planetData.sign.degree, planetData.house);
            // Adjust duration based on tempo
            let duration = this.calculateDuration(planetData.house, mapping.energy);
            duration = duration / tempoMultiplier;
            const volume = this.calculateVolume(mapping.energy, planetData.house);
            // Schedule the note
            const event = new Tone.Event((time) => {
                synth.volume.value = volume;
                synth.triggerAttackRelease(frequency, duration, time);
                console.log(`Playing Chart 1 ${planetName} in ${planetData.sign.name} (House ${planetData.house})`);
                console.log(`   Frequency: ${frequency.toFixed(1)}Hz, Duration: ${duration.toFixed(2)}s, Volume: ${volume.toFixed(1)}dB, Tempo: ${tempo}BPM`);
            }, currentTime);
            this.scheduledEvents.push(event);
            currentTime += duration + (0.2 / tempoMultiplier); // Adjust gap based on tempo
        });
        // Chart 2 planets (second half)
        currentTime = timePerChart;
        Object.entries(chart2.planets).forEach(([planetName, planetData]) => {
            const mapping = exports.planetaryMappings[planetName];
            if (!mapping)
                return;
            const synth = this.synths.get(planetName);
            if (!synth)
                return;
            const frequency = this.calculateFrequency(mapping.baseFrequency, planetData.sign.degree, planetData.house);
            // Adjust duration based on tempo
            let duration = this.calculateDuration(planetData.house, mapping.energy);
            duration = duration / tempoMultiplier;
            const volume = this.calculateVolume(mapping.energy, planetData.house);
            // Schedule the note
            const event = new Tone.Event((time) => {
                synth.volume.value = volume;
                synth.triggerAttackRelease(frequency, duration, time);
                console.log(`Playing Chart 2 ${planetName} in ${planetData.sign.name} (House ${planetData.house})`);
                console.log(`   Frequency: ${frequency.toFixed(1)}Hz, Duration: ${duration.toFixed(2)}s, Volume: ${volume.toFixed(1)}dB, Tempo: ${tempo}BPM`);
            }, currentTime);
            this.scheduledEvents.push(event);
            currentTime += duration + (0.2 / tempoMultiplier); // Adjust gap based on tempo
        });
        // Start the sequence
        Tone.Transport.start();
        // Stop after specified duration
        setTimeout(() => {
            this.stopAll();
        }, duration * 1000);
        return this.currentSession;
    }
    stopAll() {
        // Stop all scheduled events
        this.scheduledEvents.forEach(event => event.dispose());
        this.scheduledEvents = [];
        // Stop transport
        Tone.Transport.stop();
        // Disconnect synths
        this.synths.forEach(synth => synth.disconnect());
        if (this.currentSession) {
            this.currentSession.isPlaying = false;
            this.currentSession = null;
        }
    }
    getCurrentSession() {
        return this.currentSession;
    }
    // Get audio configuration for a chart
    getAudioConfig(chartData) {
        const planets = Object.keys(chartData.planets);
        const totalDuration = planets.length * 2; // Rough estimate
        return {
            mode: 'sequential',
            duration: totalDuration,
            planets,
            elements: [...new Set(planets.map(p => exports.planetaryMappings[p]?.element))],
            totalHouses: Object.keys(chartData.houses).length
        };
    }
}
exports.UniversalAudioEngine = UniversalAudioEngine;
exports.audioEngine = new UniversalAudioEngine();
//# sourceMappingURL=audioEngine.js.map