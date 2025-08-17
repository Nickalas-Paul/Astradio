import { AstroChart, AudioConfig, PlanetAudioMapping } from '../types';
export declare class AstroMusicEngine {
    private planetFrequencies;
    private genreTemplates;
    private scales;
    convertChartToAudio(chart: AstroChart, genre: 'ambient' | 'techno' | 'world' | 'hip-hop'): {
        audioConfig: AudioConfig;
        planetMappings: PlanetAudioMapping[];
    };
    private determineKey;
    private calculateTempo;
    private generateScale;
    private getKeyOffset;
    private numberToNote;
    private generatePlanetMappings;
    private getSignModifier;
    private getHouseModifier;
    private calculatePlanetVolume;
    private selectInstrument;
    private generateEnvelope;
}
export default AstroMusicEngine;
//# sourceMappingURL=astroCore.d.ts.map