import { AstroChart, AudioSession, AudioConfiguration } from '../types';
export declare const planetaryMappings: {
    Sun: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Moon: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Mercury: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Venus: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Mars: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Jupiter: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
    Saturn: {
        instrument: string;
        baseFrequency: number;
        energy: number;
        color: string;
        element: string;
        effect: string;
    };
};
export declare class UniversalAudioEngine {
    private synths;
    private currentSession;
    private isInitialized;
    private scheduledEvents;
    initialize(): Promise<void>;
    private initializeSynths;
    private calculateFrequency;
    private calculateDuration;
    private calculateVolume;
    generateSequential(chartData: AstroChart): Promise<AudioSession>;
    generateLayered(chartData: AstroChart): Promise<AudioSession>;
    generateOverlay(chart1: AstroChart, chart2: AstroChart, config?: AudioConfiguration): Promise<AudioSession>;
    stopAll(): void;
    getCurrentSession(): AudioSession | null;
    getAudioConfig(chartData: AstroChart): any;
}
export declare const audioEngine: UniversalAudioEngine;
//# sourceMappingURL=audioEngine.d.ts.map