import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { lookupVinHandler } from '../controllers/vin.controller';

const router = Router();

router.get('/:vin', requireAuth, lookupVinHandler);

export default router;
