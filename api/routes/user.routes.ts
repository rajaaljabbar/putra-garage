import { Router } from 'express';
import { getMe, updateMe } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/me', getMe);
router.put('/me', updateMe);

export default router;
