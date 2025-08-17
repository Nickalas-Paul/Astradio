export default class SwissEphemerisService {
    private mode;
    constructor();
    getMode(): string;
    private calcHousesSafe;
    calculatePlanetaryPositions(date: Date, latitude: number, longitude: number, timezone: number): Promise<{
        Sun: {
            longitude: number;
            latitude: number;
            distance: number;
        };
        Moon: {
            longitude: number;
            latitude: number;
            distance: number;
        };
        Mercury: {
            longitude: number;
            latitude: number;
            distance: number;
        };
        Venus: {
            longitude: number;
            latitude: number;
            distance: number;
        };
        Mars: {
            longitude: number;
            latitude: number;
            distance: number;
        };
        Jupiter: {
            longitude: number;
            latitude: number;
            distance: number;
        };
        Saturn: {
            longitude: number;
            latitude: number;
            distance: number;
        };
        Uranus: {
            longitude: number;
            latitude: number;
            distance: number;
        };
        Neptune: {
            longitude: number;
            latitude: number;
            distance: number;
        };
        Pluto: {
            longitude: number;
            latitude: number;
            distance: number;
        };
    } | {
        [key: string]: any;
    }>;
    calculateHouseCusps(date: Date, latitude: number, longitude: number, timezone: number): Promise<{
        cusps: any;
        ascmc: any;
        system: "P";
    } | {
        cusps: any;
        ascmc: any;
        system: "E";
    } | {
        cusps: never[];
        ascmc: never[];
        system: "NONE";
    } | {
        cusps: never[];
        ascmc: never[];
    }>;
    calculateAspects(planets: {
        [key: string]: any;
    }): any[];
    convertToAstroChart(planets: any, houses: any, aspects: any, metadata: any): {
        planets: any;
        houses: any;
        aspects: any;
        metadata: any;
    };
    private getFallbackPlanets;
}
//# sourceMappingURL=swissEphemerisService.d.ts.map