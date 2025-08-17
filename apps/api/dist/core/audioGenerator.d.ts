import { AstroChart } from '../types';
export interface AudioNote {
    frequency: number;
    duration: number;
    volume: number;
    instrument: string;
    startTime: number;
    planet?: string;
    sign?: string;
    house?: number;
}
export interface AudioComposition {
    notes: AudioNote[];
    duration: number;
    totalDuration: number;
    sampleRate: number;
    format: 'wav' | 'mp3' | 'ogg';
}
export declare class AudioGenerator {
    private sampleRate;
    constructor(sampleRate?: number);
    generateChartAudio(chart: AstroChart, duration?: number, genre?: string): AudioComposition;
    private calculateFrequency;
    private calculateVolume;
}
//# sourceMappingURL=audioGenerator.d.ts.map