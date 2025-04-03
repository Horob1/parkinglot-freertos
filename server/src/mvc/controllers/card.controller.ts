import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { CardModel } from '../models/card.model';
import { LogModel } from '../models/log.model';

// Create a new card
export const createCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uid } = req.body;

    if (!uid) {
      res.status(400).json({ message: 'UID is required' });
      return;
    }

    const existingCard = await CardModel.findOne({ uid });
    if (existingCard) {
      res.status(409).json({ message: 'Card with this UID already exists' });
      return;
    }

    const card = new CardModel({ uid });
    const savedCard = await card.save();
    res.status(201).json(savedCard);
  } catch (error) {
    res.status(500).json({
      message: 'Error creating card',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get all cards
export const getAllCards = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cards = await CardModel.find().sort({ createdAt: -1 });
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching cards',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get a single card by ID
export const getCardById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid card ID' });
      return;
    }

    const card = await CardModel.findById(id);
    if (!card) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }

    res.status(200).json(card);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching card',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update a card
export const updateCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { uid } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid card ID' });
      return;
    }

    if (!uid) {
      res.status(400).json({ message: 'UID is required' });
      return;
    }

    // Check if new UID already exists for another card
    const existingCard = await CardModel.findOne({ uid, _id: { $ne: id } });
    if (existingCard) {
      res.status(409).json({ message: 'Card with this UID already exists' });
      return;
    }

    const isCardUsed = await LogModel.findOne({ cardId: id });
    if (isCardUsed) {
      res.status(409).json({ message: 'Card is used in a parking log' });
      return;
    }

    const updatedCard = await CardModel.findByIdAndUpdate(id, { uid }, { new: true, runValidators: true });

    if (!updatedCard) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }

    res.status(200).json(updatedCard);
  } catch (error) {
    res.status(500).json({
      message: 'Error updating card',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete a card
export const deleteCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const isCardUsed = await LogModel.findOne({ cardId: id });
    if (isCardUsed) {
      res.status(409).json({ message: 'Card is used in a parking log' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid card ID' });
      return;
    }

    const deletedCard = await CardModel.findByIdAndDelete(id);
    if (!deletedCard) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }

    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting card',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
