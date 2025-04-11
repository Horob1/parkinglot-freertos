import express from 'express';
import { getConfigBillPerHour, updateConfigBillPerHour } from '../controllers/config.controller';
import auth from '../middlewares/auth';

const router = express.Router();

router.get('/bill', getConfigBillPerHour);
router.use(auth);
router.put('/bill', updateConfigBillPerHour);

export default router;
