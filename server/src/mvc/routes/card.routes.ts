import express from 'express';
import * as cardController from '../controllers/card.controller';
import auth from '../middlewares/auth';

const router = express.Router();

router.use(auth);

// Create a new card
router.post('/', cardController.createCard);

router.get('/unused', cardController.getUnusedCards);

// Get all cards
router.get('/', cardController.getAllCards);

// Get a single card by ID
router.get('/:id', cardController.getCardById);

// Update a card
router.put('/:id', cardController.updateCard);

// Delete a card
router.delete('/:id', cardController.deleteCard);

export default router;
