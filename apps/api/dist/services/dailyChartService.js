"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyChartService = void 0;
const database_1 = require("../database");
const uuid_1 = require("uuid");
class DailyChartService {
    /**
     * Generate daily chart for a specific date
     */
    static async generateDailyChart(date) {
        const db = await (0, database_1.getDatabase)();
        // Check if daily chart already exists
        const existingChart = await this.getDailyChart(date);
        if (existingChart) {
            return existingChart;
        }
        console.log(`🌅 Generating daily chart for ${date}`);
        // Generate chart data - temporarily simplified
        const chartData = {
            planets: {},
            houses: {},
            metadata: {
                conversion_method: 'simplified',
                birth_datetime: new Date(date).toISOString()
            }
        };
        // Generate audio configuration - temporarily simplified
        const audioConfig = {
            genre: 'ambient',
            tempo: 60,
            key: 'C',
            scale: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
        };
        // Generate narration - temporarily simplified
        const narration = {
            text: `Daily chart for ${date}`,
            generated_at: new Date().toISOString()
        };
        const dailyChart = {
            id: (0, uuid_1.v4)(),
            date,
            chart_data: chartData,
            narration,
            audio_config: audioConfig,
            created_at: new Date().toISOString()
        };
        // Save to database
        await db.run(`INSERT INTO daily_charts (id, date, chart_data, narration, audio_config, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)`, [
            dailyChart.id,
            dailyChart.date,
            JSON.stringify(dailyChart.chart_data),
            JSON.stringify(dailyChart.narration),
            JSON.stringify(dailyChart.audio_config),
            dailyChart.created_at
        ]);
        console.log(`✅ Daily chart generated for ${date}`);
        return dailyChart;
    }
    /**
     * Get daily chart by date
     */
    static async getDailyChart(date) {
        const db = await (0, database_1.getDatabase)();
        const chart = await db.get('SELECT * FROM daily_charts WHERE date = ?', [date]);
        if (!chart)
            return null;
        return {
            ...chart,
            chart_data: JSON.parse(chart.chart_data),
            narration: chart.narration ? JSON.parse(chart.narration) : undefined,
            audio_config: chart.audio_config ? JSON.parse(chart.audio_config) : undefined
        };
    }
    /**
     * Get latest daily chart
     */
    static async getLatestDailyChart() {
        const db = await (0, database_1.getDatabase)();
        const chart = await db.get('SELECT * FROM daily_charts ORDER BY date DESC LIMIT 1');
        if (!chart)
            return null;
        return {
            ...chart,
            chart_data: JSON.parse(chart.chart_data),
            narration: chart.narration ? JSON.parse(chart.narration) : undefined,
            audio_config: chart.audio_config ? JSON.parse(chart.audio_config) : undefined
        };
    }
    /**
     * Get daily charts for a date range
     */
    static async getDailyCharts(startDate, endDate) {
        const db = await (0, database_1.getDatabase)();
        const charts = await db.all('SELECT * FROM daily_charts WHERE date BETWEEN ? AND ? ORDER BY date DESC', [startDate, endDate]);
        return charts.map((chart) => ({
            ...chart,
            chart_data: JSON.parse(chart.chart_data),
            narration: chart.narration ? JSON.parse(chart.narration) : undefined,
            audio_config: chart.audio_config ? JSON.parse(chart.audio_config) : undefined
        }));
    }
    /**
     * Generate missing daily charts for a date range
     */
    static async generateMissingCharts(startDate, endDate) {
        const db = await (0, database_1.getDatabase)();
        // Get existing charts in range
        const existingCharts = await db.all('SELECT date FROM daily_charts WHERE date BETWEEN ? AND ?', [startDate, endDate]);
        const existingDates = new Set(existingCharts.map(chart => chart.date));
        const generatedCharts = [];
        // Generate charts for missing dates
        const currentDate = new Date(startDate);
        const endDateObj = new Date(endDate);
        while (currentDate <= endDateObj) {
            const dateStr = currentDate.toISOString().split('T')[0];
            if (!existingDates.has(dateStr)) {
                try {
                    const chart = await this.generateDailyChart(dateStr);
                    generatedCharts.push(chart);
                }
                catch (error) {
                    console.error(`Failed to generate daily chart for ${dateStr}:`, error);
                }
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return generatedCharts;
    }
    /**
     * Get daily chart statistics
     */
    static async getDailyChartStats() {
        const db = await (0, database_1.getDatabase)();
        const totalCharts = await db.get('SELECT COUNT(*) as count FROM daily_charts');
        const dateRange = await db.get('SELECT MIN(date) as start, MAX(date) as end FROM daily_charts');
        const latestChart = await db.get('SELECT date FROM daily_charts ORDER BY date DESC LIMIT 1');
        return {
            totalCharts: totalCharts.count,
            dateRange: {
                start: dateRange.start || '',
                end: dateRange.end || ''
            },
            latestChart: latestChart?.date || ''
        };
    }
}
exports.DailyChartService = DailyChartService;
