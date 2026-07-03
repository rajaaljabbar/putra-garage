import { Router } from 'express';
import { getVehicles, getVehicle, addVehicle, updateVehicleData, removeVehicle } from '../controllers/vehicle.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getVehicles);
router.post('/', addVehicle);
router.get('/:id', getVehicle);
router.put('/:id', updateVehicleData);
router.delete('/:id', removeVehicle);

export default router;
