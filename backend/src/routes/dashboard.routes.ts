import { Router } from 'express';
import { stats } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/stats', stats);

export default router;