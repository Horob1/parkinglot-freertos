import { Request, Response } from 'express';
import { TaskStatsModel } from '../models/taskStats.model';

// get all task stats
export const getTaskStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await TaskStatsModel.find().sort({ createdAt: -1 });
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching task stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
