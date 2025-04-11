import express from 'express';
import * as clientController from '../controllers/client.controller';
import auth from '../middlewares/auth';

const router = express.Router();

router.use(auth);

router.get('/', clientController.getAllClients);

router.get('/:id', clientController.getClientById);

router.post('/', clientController.createClient);

router.put('/:id', clientController.updateClient);

router.delete('/:id', clientController.deleteClient);

export default router;
