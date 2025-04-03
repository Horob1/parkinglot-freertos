import express from 'express';
import { getMe } from '../controllers/user.controller';

const router = express.Router();

router.get('/me', getMe);

export default router;
