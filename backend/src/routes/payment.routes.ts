import { Router } from 'express';
import { list, create, remove } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPaymentSchema } from '../validators/schemas';

const router = Router();
router.use(authenticate);

router.get('/', list);
router.post('/', validate(createPaymentSchema), create);
router.delete('/:id', remove);

export default router;