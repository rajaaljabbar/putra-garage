import { Router } from 'express';
import { getMe, updateMe, deleteMe } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/me', getMe);
router.put('/me', updateMe);
router.delete('/me', deleteMe);

export default router;
