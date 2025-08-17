import { AudioConfig, PlanetAudioMapping } from '@astradio/types';
export declare class BrowserAudioEngine {
    private synths;
    private reverb;
    private delay;
    private compressor;
    private isPlaying;
    private sequence;
    constructor();
    initializeAudio(): Promise<void>;
    private createSynth;
    private getPlanetFilterFreq;
    generateMusicFromChart(audioConfig: AudioConfig, planetMappings: PlanetAudioMapping[]): void;
    private createSequence;
    private generateNoteSequence;
    private getGenrePattern;
    private distributeNotesForPlanet;
    private getNoteDuration;
    private getSubdivisionForGenre;
    play(): Promise<void>;
    stop(): void;
    pause(): void;
    resume(): void;
    setVolume(volume: number): void;
    isCurrentlyPlaying(): boolean;
    dispose(): void;
}
