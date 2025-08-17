"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioGenerator = void 0;
class AudioGenerator {
    constructor(sampleRate = 44100) {
        this.sampleRate = sampleRate;
    }
    // Generate audio composition from astrological chart
    generateChartAudio(chart, duration = 60, genre = 'ambient') {
        const notes = [];
        const secondsPerHouse = duration / 12;
        // Base planetary mappings
        const basePlanetaryMappings = {
            Sun: { baseFrequency: 264, energy: 0.8, instrument: 'sine' },
            Moon: { baseFrequency: 294, energy: 0.4, instrument: 'triangle' },
            Mercury: { baseFrequency: 392, energy: 0.6, instrument: 'sine' },
            Venus: { baseFrequency: 349, energy: 0.5, instrument: 'triangle' },
            Mars: { baseFrequency: 330, energy: 0.9, instrument: 'sawtooth' },
            Jupiter: { baseFrequency: 440, energy: 0.7, instrument: 'sine' },
            Saturn: { baseFrequency: 220, energy: 0.3, instrument: 'square' },
            Uranus: { baseFrequency: 523, energy: 0.6, instrument: 'sawtooth' },
            Neptune: { baseFrequency: 494, energy: 0.4, instrument: 'triangle' },
            Pluto: { baseFrequency: 147, energy: 0.2, instrument: 'square' }
        };
        // Sort planets by house position
        const planetEntries = Object.entries(chart.planets);
        planetEntries.sort((a, b) => a[1].house - b[1].house);
        let currentTime = 0;
        planetEntries.forEach(([planetName, planetData]) => {
            const mapping = basePlanetaryMappings[planetName];
            if (!mapping)
                return;
            const frequency = this.calculateFrequency(mapping.baseFrequency, planetData.sign.degree, planetData.house);
            const noteDuration = secondsPerHouse * 0.8; // Use 80% of house time
            const volume = this.calculateVolume(mapping.energy, planetData.house);
            notes.push({
                frequency,
                duration: noteDuration,
                volume,
                instrument: mapping.instrument,
                startTime: currentTime,
                planet: planetName,
                sign: planetData.sign.name,
                house: planetData.house
            });
            currentTime += secondsPerHouse;
        });
        return {
            notes,
            duration,
            totalDuration: duration,
            sampleRate: this.sampleRate,
            format: 'wav'
        };
    }
    calculateFrequency(baseFreq, signDegree, house) {
        const degreeMultiplier = 1 + (signDegree / 30) * 0.5;
        const houseMultiplier = 1 + (house - 1) * 0.1;
        return baseFreq * degreeMultiplier * houseMultiplier;
    }
    calculateVolume(planetEnergy, house) {
        const baseVolume = 0.3;
        const energyGain = planetEnergy * 0.4;
        const houseGain = (house - 1) * 0.05;
        return Math.min(0.8, baseVolume + energyGain + houseGain);
    }
}
exports.AudioGenerator = AudioGenerator;
//# sourceMappingURL=audioGenerator.js.map