import { Request, Response } from 'express';
import { ConfigModel } from '../models/config.model';

export const getConfigBillPerHour = async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = await ConfigModel.findOne({ name: 'billPerHour' });
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching config',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateConfigBillPerHour = async (req: Request, res: Response): Promise<void> => {
  try {
    const { value } = req.body;
    if (!value) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const updatedConfig = await ConfigModel.findOneAndUpdate({ name: 'billPerHour' }, { value }, { new: true });
    if (!updatedConfig) {
      res.status(404).json({ message: 'Config not found' });
      return;
    }

    res.status(200).json(updatedConfig);
  } catch (error) {
    res.status(500).json({
      message: 'Error updating config',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
