declare module 'swisseph' {
  export const SUN: number;
  export const MOON: number;
  export const MERCURY: number;
  export const VENUS: number;
  export const MARS: number;
  export const JUPITER: number;
  export const SATURN: number;
  export const URANUS: number;
  export const NEPTUNE: number;
  export const PLUTO: number;
  
  export const GREG_CAL: number;
  export const SWIEPH: number;
  export const SPEED: number;
  export const APPARENT: number;
  export const OK: number;
  export const WARN: number;
  
  export function julday(year: number, month: number, day: number, hour: number, gregflag: number): number;
  export function calc_ut(jd: number, planet: number, flags: number, callback: (result: any) => void): void;
}
