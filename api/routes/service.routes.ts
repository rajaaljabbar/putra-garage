import { Router } from 'express';
import { getServices, addService, getServiceDetails } from '../controllers/service.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/vehicle/:vehicleId', getServices);
router.post('/vehicle/:vehicleId', addService);
router.get('/:id', getServiceDetails);

export default router;
