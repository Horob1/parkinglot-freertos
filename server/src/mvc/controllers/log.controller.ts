import { Request, Response } from 'express';
import { LogModel } from '../models/log.model';
import { CardModel } from '../models/card.model';
import { ClientModel } from '../models/client.model';
import { ConfigModel } from '../models/config.model';

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
    }).populate('cardId clientId');

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

export const checkUncheckedLog = async (req: Request, res: Response) => {
  try {
    const logs = await LogModel.find({ isCheckout: false }).populate('cardId clientId');
    const config = await ConfigModel.findOne({ name: 'billPerHour' });
    if (!config) {
      return res.status(404).json({ message: 'Config not found' });
    }
    logs.forEach(log => {
      const bill = Math.ceil((Date.now() - log.createdAt.getTime()) / 3600000) * Number(config.value);
      log.bill = bill;
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

export const checkLog = async (req: Request, res: Response) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const card = await CardModel.findOne({ uid });
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const log = await LogModel.findOne({ cardId: card._id, isCheckout: false });

    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({
      message: 'Error during login',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getLogHistoryByCard = async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    const card = await CardModel.findOne({ uid });

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const user = await ClientModel.findOne({ cardId: card._id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const logs = await LogModel.find({ cardId: card._id, clientId: user._id });

    res.status(200).json({
      message: 'Logs retrieved and analyzed successfully',
      logs,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error during login',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
