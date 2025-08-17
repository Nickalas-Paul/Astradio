import { AudioConfig, ChartData } from '@astradio/shared';
export declare function keyFromChart(chart: ChartData): string;
export declare function tempoFromMotion(chart: ChartData, genre: string): number;
export declare function scaleFromGenre(genre: string): number[];
export declare function aspectWeights(chart: ChartData): number;
export declare function generateFrames(cfg: AudioConfig, chart: ChartData, chartB?: ChartData): AsyncGenerator<Int16Array>;
export declare function generateWavHeader(sampleRate: number, dataSize: number): Buffer;
//# sourceMappingURL=index.d.ts.map