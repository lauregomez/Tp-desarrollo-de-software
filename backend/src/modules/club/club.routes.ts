import { Router } from 'express';
import { clubController } from './club.controller';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';

const router = Router();

router.get('/',        asyncHandler(clubController.getAll));
router.get('/:id',     asyncHandler(clubController.getById));
router.post('/',       authenticate, authorize('ADMIN'), asyncHandler(clubController.create));
router.put('/:id',     authenticate, authorize('ADMIN'), asyncHandler(clubController.update));
router.delete('/:id',  authenticate, authorize('ADMIN'), asyncHandler(clubController.remove));

export default router;