import express from 'express';
import { getLog } from '../controllers/log.controller';

const router = express.Router();

router.get('/', getLog);

export default router;
