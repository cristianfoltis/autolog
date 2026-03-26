import { Router } from 'express';
import { makesHandler, modelsHandler } from '../controllers/lov.controller';

const router = Router();

router.get('/makes', makesHandler);
router.get('/models', modelsHandler);

export default router;
