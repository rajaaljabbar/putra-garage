import { Router } from 'express';
import { uploadImage } from '../controllers/upload.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);
router.post('/', uploadImage);

export default router;
