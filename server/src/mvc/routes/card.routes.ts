import express from 'express';
import * as cardController from '../controllers/card.controller';

const router = express.Router();

// Create a new card
router.post('/', cardController.createCard);

// Get all cards
router.get('/', cardController.getAllCards);

// Get a single card by ID
router.get('/:id', cardController.getCardById);

// Update a card
router.put('/:id', cardController.updateCard);

// Delete a card
router.delete('/:id', cardController.deleteCard);

export default router;
