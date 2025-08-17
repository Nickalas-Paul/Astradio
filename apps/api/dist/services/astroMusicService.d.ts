import { AstroChart } from '../types';
export interface MusicGenerationRequest {
    chartData: AstroChart;
    genre: string;
    duration: number;
    volume: number;
}
export interface MusicGenerationResponse {
    success: boolean;
    audioUrl?: string;
    duration: number;
    genre: string;
    notes: any[];
    error?: string;
}
declare class AstroMusicService {
    private audioGenerator;
    constructor();
    generateMusicFromChart(request: MusicGenerationRequest): Promise<MusicGenerationResponse>;
    generateDailyMusic(genre?: string, duration?: number): Promise<MusicGenerationResponse>;
    private getDailyChartData;
    getAvailableGenres(): string[];
    getGenreInfo(genre: string): {
        name: string;
        description: string;
        characteristics: string[];
    };
}
export default AstroMusicService;
//# sourceMappingURL=astroMusicService.d.ts.map