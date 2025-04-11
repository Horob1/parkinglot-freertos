import express from 'express';
import { getLog, checkLog, getLogHistoryByCard, checkUncheckedLog } from '../controllers/log.controller';
import auth from '../middlewares/auth';
const router = express.Router();

router.post('/check', checkLog);
router.get('/history/:uid', getLogHistoryByCard);

router.use(auth);
router.get('/', getLog);
router.get('/unchecked', checkUncheckedLog);

export default router;
