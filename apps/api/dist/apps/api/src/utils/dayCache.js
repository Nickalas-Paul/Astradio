// Simple once-per-day cache with TTL (default 24h). No deps.
export class DayCache {
    ttlMs;
    day = '';
    value;
    constructor(ttlMs = 24 * 60 * 60 * 1000) {
        this.ttlMs = ttlMs;
    }
    get(today) {
        if (!this.value)
            return undefined;
        if (this.day !== today)
            return undefined;
        return this.value;
    }
    set(today, v) {
        this.day = today;
        this.value = v;
        setTimeout(() => { if (this.day === today)
            this.value = undefined; }, this.ttlMs);
    }
}
export const isoDay = (d = new Date()) => d.toISOString().slice(0, 10);
