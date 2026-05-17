import { Router } from 'express';
import { list, get, create, update, updateStatus, remove } from '../controllers/invoice.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createInvoiceSchema, updateInvoiceSchema, updateInvoiceStatusSchema } from '../validators/schemas';

const router = Router();
router.use(authenticate);

router.get('/', list);
router.get('/:id', get);
router.post('/', validate(createInvoiceSchema), create);
router.put('/:id', validate(updateInvoiceSchema), update);
router.patch('/:id/status', validate(updateInvoiceStatusSchema), updateStatus);
router.delete('/:id', remove);

export default router;