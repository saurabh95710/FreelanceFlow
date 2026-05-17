import { Router } from 'express';
import { list, get, create, update, remove } from '../controllers/client.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createClientSchema, updateClientSchema } from '../validators/schemas';

const router = Router();
router.use(authenticate);

router.get('/', list);
router.get('/:id', get);
router.post('/', validate(createClientSchema), create);
router.put('/:id', validate(updateClientSchema), update);
router.delete('/:id', remove);

export default router;