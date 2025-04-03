import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SlotModel } from '../models/slot.model';
import { LogModel } from '../models/log.model';

// Create a new slot
export const createSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { number } = req.body;

    if (typeof number !== 'number' || number < 1) {
      res.status(400).json({ message: 'Valid slot number is required' });
      return;
    }

    const existingSlot = await SlotModel.findOne({ number });
    if (existingSlot) {
      res.status(409).json({ message: 'Slot number already exists' });
      return;
    }

    const slot = new SlotModel({ number });
    const savedSlot = await slot.save();
    res.status(201).json(savedSlot);
  } catch (error) {
    res.status(500).json({
      message: 'Error creating slot',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get all slots
export const getAllSlots = async (_req: Request, res: Response): Promise<void> => {
  try {
    const slots = await SlotModel.find().sort({ number: 1 });
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching slots',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get a single slot by ID
export const getSlotById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid slot ID' });
      return;
    }

    const slot = await SlotModel.findById(id);
    if (!slot) {
      res.status(404).json({ message: 'Slot not found' });
      return;
    }

    res.status(200).json(slot);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching slot',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update a slot
export const updateSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { number, isEmpty } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid slot ID' });
      return;
    }

    if (number !== undefined && (typeof number !== 'number' || number < 1)) {
      res.status(400).json({ message: 'Valid slot number is required' });
      return;
    }

    if (isEmpty !== undefined && typeof isEmpty !== 'boolean') {
      res.status(400).json({ message: 'isEmpty must be a boolean value' });
      return;
    }

    // Check if the new number already exists
    if (number !== undefined) {
      const existingSlot = await SlotModel.findOne({
        number,
        _id: { $ne: id },
      });
      if (existingSlot) {
        res.status(409).json({ message: 'Slot number already exists' });
        return;
      }
    }

    const updateData: { number?: number; isEmpty?: boolean } = {};
    if (number !== undefined) updateData.number = number;
    if (isEmpty !== undefined) updateData.isEmpty = isEmpty;

    const updatedSlot = await SlotModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!updatedSlot) {
      res.status(404).json({ message: 'Slot not found' });
      return;
    }

    res.status(200).json(updatedSlot);
  } catch (error) {
    res.status(500).json({
      message: 'Error updating slot',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete a slot
export const deleteSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid slot ID' });
      return;
    }

    // Check if the slot is referenced in any logs
    const isSlotUsed = await LogModel.findOne({ slotId: id });
    if (isSlotUsed) {
      res.status(409).json({ message: 'Slot is used in parking logs and cannot be deleted' });
      return;
    }

    const deletedSlot = await SlotModel.findByIdAndDelete(id);
    if (!deletedSlot) {
      res.status(404).json({ message: 'Slot not found' });
      return;
    }

    res.status(200).json({ message: 'Slot deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting slot',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
