import { Router, Request, Response } from 'express';
import DailyChartController from '../controllers/dailyChartController';

const router = Router();
const dailyChartController = new DailyChartController();

// Today's chart endpoint
router.get('/today', async (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    req.params = { date: today };
    await dailyChartController.getChartForDate(req, res);
  } catch (error) {
    console.error('Today chart error:', error);
    res.status(500).json({ error: 'Failed to generate today chart' });
  }
});

export default router;
