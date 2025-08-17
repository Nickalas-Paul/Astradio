"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserAudioEngine = void 0;
// Browser-based audio engine using Tone.js for real-time audio generation
const Tone = __importStar(require("tone"));
class BrowserAudioEngine {
    synths = new Map();
    reverb;
    delay;
    compressor;
    isPlaying = false;
    sequence = null;
    constructor() {
        // Initialize effects
        this.reverb = new Tone.Reverb({
            decay: 2,
            wet: 0.3
        });
        this.delay = new Tone.FeedbackDelay({
            delayTime: "8n",
            feedback: 0.2,
            wet: 0.1
        });
        this.compressor = new Tone.Compressor({
            threshold: -20,
            ratio: 4,
            attack: 0.003,
            release: 0.1
        });
        // Connect effects chain
        this.reverb.connect(this.delay);
        this.delay.connect(this.compressor);
        this.compressor.toDestination();
    }
    async initializeAudio() {
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }
    }
    createSynth(instrument, planetName) {
        let oscillatorType = 'sine';
        switch (instrument) {
            case 'sine':
                oscillatorType = 'sine';
                break;
            case 'triangle':
                oscillatorType = 'triangle';
                break;
            case 'square':
                oscillatorType = 'square';
                break;
            case 'sawtooth':
                oscillatorType = 'sawtooth';
                break;
            default:
                oscillatorType = 'sine';
        }
        const synth = new Tone.Synth({
            oscillator: {
                type: oscillatorType
            },
            envelope: {
                attack: 0.1,
                decay: 0.2,
                sustain: 0.7,
                release: 0.8
            }
        });
        // Apply planet-specific filtering
        const filter = new Tone.Filter({
            frequency: this.getPlanetFilterFreq(planetName),
            type: 'lowpass',
            rolloff: -24
        });
        synth.connect(filter);
        filter.connect(this.reverb);
        return synth;
    }
    getPlanetFilterFreq(planet) {
        const filterMap = {
            'Sun': 2000,
            'Moon': 1500,
            'Mercury': 3000,
            'Venus': 1800,
            'Mars': 2500,
            'Jupiter': 1200,
            'Saturn': 800,
            'Uranus': 4000,
            'Neptune': 1000,
            'Pluto': 600
        };
        return filterMap[planet] || 2000;
    }
    generateMusicFromChart(audioConfig, planetMappings) {
        this.stop(); // Stop any existing playback
        // Set tempo
        Tone.getTransport().bpm.value = audioConfig.tempo;
        // Create synths for each planet
        planetMappings.forEach(mapping => {
            const synth = this.createSynth(mapping.instrument, mapping.planet);
            // Apply envelope from mapping
            synth.envelope.attack = mapping.envelope.attack;
            synth.envelope.decay = mapping.envelope.decay;
            synth.envelope.sustain = mapping.envelope.sustain;
            synth.envelope.release = mapping.envelope.release;
            this.synths.set(mapping.planet, synth);
        });
        // Create musical sequence
        this.createSequence(audioConfig, planetMappings);
    }
    createSequence(audioConfig, planetMappings) {
        const notes = this.generateNoteSequence(audioConfig, planetMappings);
        const subdivision = this.getSubdivisionForGenre(audioConfig.genre);
        this.sequence = new Tone.Sequence((time, note) => {
            if (note && note.planet && note.frequency) {
                const synth = this.synths.get(note.planet);
                if (synth) {
                    const noteFreq = Tone.Frequency(note.frequency, "hz");
                    synth.triggerAttackRelease(noteFreq.toNote(), note.duration, time, note.volume);
                }
            }
        }, notes, subdivision);
    }
    generateNoteSequence(audioConfig, planetMappings) {
        const sequence = [];
        const totalSteps = 32; // 32-step sequence
        // Generate rhythmic pattern based on genre
        const pattern = this.getGenrePattern(audioConfig.genre);
        planetMappings.forEach((mapping, planetIndex) => {
            const planetSteps = this.distributeNotesForPlanet(mapping, pattern, totalSteps);
            planetSteps.forEach((step, stepIndex) => {
                if (step.active) {
                    sequence[stepIndex] = {
                        planet: mapping.planet,
                        frequency: mapping.frequency,
                        duration: step.duration,
                        volume: mapping.volume * step.intensity
                    };
                }
            });
        });
        // Fill empty slots with null for rests
        for (let i = sequence.length; i < totalSteps; i++) {
            sequence[i] = null;
        }
        return sequence;
    }
    getGenrePattern(genre) {
        const patterns = {
            ambient: {
                rhythm: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                intensity: [0.8, 0, 0, 0, 0.6, 0, 0, 0, 0.7, 0, 0, 0, 0.5, 0, 0, 0]
            },
            techno: {
                rhythm: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                intensity: [1.0, 0, 0.7, 0, 0.8, 0, 0.6, 0, 1.0, 0, 0.7, 0, 0.8, 0, 0.6, 0]
            },
            world: {
                rhythm: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
                intensity: [0.9, 0, 0, 0.6, 0, 0.7, 0, 0, 0.8, 0, 0, 0.5, 0, 0.6, 0, 0]
            },
            'hip-hop': {
                rhythm: [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
                intensity: [1.0, 0, 0, 0, 0.8, 0, 0.6, 0, 0.9, 0, 0, 0, 0.7, 0, 0.5, 0]
            }
        };
        return patterns[genre] || patterns.ambient;
    }
    distributeNotesForPlanet(mapping, pattern, totalSteps) {
        const steps = [];
        for (let i = 0; i < totalSteps; i++) {
            const patternIndex = i % pattern.rhythm.length;
            const isActive = pattern.rhythm[patternIndex] === 1 && Math.random() > 0.3; // Add some variation
            steps.push({
                active: isActive,
                duration: this.getNoteDuration(mapping.planet),
                intensity: pattern.intensity[patternIndex] || 0.5
            });
        }
        return steps;
    }
    getNoteDuration(planet) {
        const durations = {
            'Sun': '2n',
            'Moon': '4n',
            'Mercury': '8n',
            'Venus': '4n',
            'Mars': '8n',
            'Jupiter': '2n',
            'Saturn': '1n',
            'Uranus': '8n',
            'Neptune': '4n',
            'Pluto': '2n'
        };
        return durations[planet] || '4n';
    }
    getSubdivisionForGenre(genre) {
        const subdivisions = {
            'ambient': '4n',
            'techno': '16n',
            'world': '8n',
            'hip-hop': '16n'
        };
        return subdivisions[genre] || '4n';
    }
    async play() {
        if (!this.sequence) {
            console.warn('No sequence available to play');
            return;
        }
        await this.initializeAudio();
        this.sequence.start(0);
        Tone.getTransport().start();
        this.isPlaying = true;
    }
    stop() {
        if (this.sequence) {
            this.sequence.stop();
            this.sequence.dispose();
            this.sequence = null;
        }
        Tone.getTransport().stop();
        Tone.getTransport().cancel();
        // Dispose of all synths
        this.synths.forEach(synth => synth.dispose());
        this.synths.clear();
        this.isPlaying = false;
    }
    pause() {
        if (this.isPlaying) {
            Tone.getTransport().pause();
            this.isPlaying = false;
        }
    }
    resume() {
        if (!this.isPlaying) {
            Tone.getTransport().start();
            this.isPlaying = true;
        }
    }
    setVolume(volume) {
        Tone.getDestination().volume.value = Tone.gainToDb(Math.max(0, Math.min(1, volume)));
    }
    isCurrentlyPlaying() {
        return this.isPlaying && Tone.getTransport().state === 'started';
    }
    dispose() {
        this.stop();
        this.reverb.dispose();
        this.delay.dispose();
        this.compressor.dispose();
    }
}
exports.BrowserAudioEngine = BrowserAudioEngine;
