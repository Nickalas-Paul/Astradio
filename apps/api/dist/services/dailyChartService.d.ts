export interface DailyChart {
    id: string;
    date: string;
    chart_data: any;
    narration?: any;
    audio_config?: any;
    created_at: string;
}
export declare class DailyChartService {
    /**
     * Generate daily chart for a specific date
     */
    static generateDailyChart(date: string): Promise<DailyChart>;
    /**
     * Get daily chart by date
     */
    static getDailyChart(date: string): Promise<DailyChart | null>;
    /**
     * Get latest daily chart
     */
    static getLatestDailyChart(): Promise<DailyChart | null>;
    /**
     * Get daily charts for a date range
     */
    static getDailyCharts(startDate: string, endDate: string): Promise<DailyChart[]>;
    /**
     * Generate missing daily charts for a date range
     */
    static generateMissingCharts(startDate: string, endDate: string): Promise<DailyChart[]>;
    /**
     * Get daily chart statistics
     */
    static getDailyChartStats(): Promise<{
        totalCharts: number;
        dateRange: {
            start: string;
            end: string;
        };
        latestChart: string;
    }>;
}
