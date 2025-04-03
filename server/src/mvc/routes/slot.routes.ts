import { Router } from 'express';
import * as slotController from '../controllers/slot.controller';

const router = Router();

// // Create a new slot
// router.post('/', slotController.createSlot);

// Get all slots
router.get('/', slotController.getAllSlots);

// // Get a single slot by ID
// router.get('/:id', slotController.getSlotById);

// // Update a slot
// router.put('/:id', slotController.updateSlot);

// // Delete a slot
// router.delete('/:id', slotController.deleteSlot);

export default router;
