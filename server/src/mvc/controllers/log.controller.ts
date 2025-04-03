import { Request, Response } from 'express';
import { LogModel } from '../models/log.model';

export const getLog = async (req: Request, res: Response) => {
  try {
    const { date, period } = req.query;

    if (!date || !period) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    let startDate: Date, endDate: Date;
    const targetDate = new Date(date as string);

    switch (period) {
      case 'day':
        startDate = new Date(targetDate.setHours(0, 0, 0, 0));
        endDate = new Date(targetDate.setHours(23, 59, 59, 999));
        break;
      case 'week':
        startDate = new Date(targetDate.setDate(targetDate.getDate() - targetDate.getDay()));
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        break;
      case 'month':
        startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
        break;
      case 'year':
        startDate = new Date(targetDate.getFullYear(), 0, 1);
        endDate = new Date(targetDate.getFullYear(), 11, 31);
        break;
      default:
        return res.status(400).json({ message: 'Invalid period' });
    }

    const logs = await LogModel.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    res.status(200).json({
      message: 'Logs retrieved and analyzed successfully',
      logs,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error during login',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
