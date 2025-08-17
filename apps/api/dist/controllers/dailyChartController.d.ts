import { Request, Response } from 'express';
declare class DailyChartController {
    private swissEphService;
    private musicEngine;
    constructor();
    generateDailyChart(req: Request, res: Response): Promise<void>;
    getChartForDate(req: Request, res: Response): Promise<void>;
    getAvailableGenres(req: Request, res: Response): Promise<void>;
    getSwissEphStatus(req: Request, res: Response): Promise<void>;
}
export default DailyChartController;
//# sourceMappingURL=dailyChartController.d.ts.map