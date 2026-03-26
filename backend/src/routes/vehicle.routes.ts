import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  listVehicles,
  getVehicle,
  createVehicleHandler,
  updateVehicleHandler,
  deleteVehicleHandler,
} from '../controllers/vehicle.controller';

const router = Router();

router.use(requireAuth);

router.get('/', listVehicles);
router.get('/:id', getVehicle);
router.post('/', createVehicleHandler);
router.put('/:id', updateVehicleHandler);
router.delete('/:id', deleteVehicleHandler);

export default router;
