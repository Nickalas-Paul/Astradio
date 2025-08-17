import express from 'express';
declare const app: express.Application;
export interface PlanetData {
    longitude: number;
    sign: SignData;
    house: number;
    retrograde: boolean;
}
export interface SignData {
    name: string;
    degree: number;
    element: 'Fire' | 'Earth' | 'Air' | 'Water';
    modality: 'Cardinal' | 'Fixed' | 'Mutable';
}
export interface HouseData {
    cusp_longitude: number;
    sign: SignData;
}
export interface AspectData {
    planet1: string;
    planet2: string;
    type: string;
    angle: number;
    harmonic: string;
}
export interface AstroChart {
    planets: {
        [key: string]: PlanetData;
    };
    houses: {
        [key: string]: HouseData;
    };
    aspects?: AspectData[];
    metadata: {
        conversion_method: string;
        birth_datetime: string;
        coordinate_system: string;
    };
}
export default app;
//# sourceMappingURL=app-production.d.ts.map