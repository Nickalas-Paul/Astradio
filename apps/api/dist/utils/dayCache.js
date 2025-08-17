"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isoDay = exports.DayCache = void 0;
// Simple once-per-day cache with TTL (default 24h). No deps.
class DayCache {
    constructor(ttlMs = 24 * 60 * 60 * 1000) {
        this.ttlMs = ttlMs;
        this.day = '';
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
exports.DayCache = DayCache;
const isoDay = (d = new Date()) => d.toISOString().slice(0, 10);
exports.isoDay = isoDay;
//# sourceMappingURL=dayCache.js.map