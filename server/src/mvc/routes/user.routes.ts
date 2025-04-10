import express from 'express';
import { getMe } from '../controllers/user.controller';
import auth from '../middlewares/auth';

const router = express.Router();

router.use(auth);
router.get('/me', getMe);

export default router;
