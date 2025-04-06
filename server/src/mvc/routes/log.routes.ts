import express from 'express';
import { getLog, checkLog } from '../controllers/log.controller';
import auth from '../middlewares/auth';
const router = express.Router();

router.post('/check', checkLog);

router.use(auth);
router.get('/', getLog);

export default router;
