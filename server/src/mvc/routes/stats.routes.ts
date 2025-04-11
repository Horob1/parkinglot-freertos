import express from 'express';
import { getTaskStats } from '../controllers/stats.controller';

const router = express.Router();

router.get('/', getTaskStats);

export default router;
