import { Router } from 'express';
import { updateProfile } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema } from '../validators/schemas';

const router = Router();
router.use(authenticate);
router.put('/profile', validate(updateProfileSchema), updateProfile);

export default router;