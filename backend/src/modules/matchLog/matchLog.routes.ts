import { Router } from 'express';
import { matchLogController } from './matchLog.controller';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), asyncHandler(matchLogController.getAll));

export default router;