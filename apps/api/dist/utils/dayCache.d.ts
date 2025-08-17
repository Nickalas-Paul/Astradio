export declare class DayCache<T> {
    private ttlMs;
    private day;
    private value;
    constructor(ttlMs?: number);
    get(today: string): T;
    set(today: string, v: T): void;
}
export declare const isoDay: (d?: Date) => string;
//# sourceMappingURL=dayCache.d.ts.map