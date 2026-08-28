import { Router } from 'express';
import { courtController } from './court.controller';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';


const router = Router();

router.get('/',        asyncHandler(courtController.getAll));
router.get('/:id',     asyncHandler(courtController.getById));
router.post('/',       authenticate, authorize('ADMIN'), asyncHandler(courtController.create));
router.put('/:id',     authenticate, authorize('ADMIN'), asyncHandler(courtController.update));
router.delete('/:id',  authenticate, authorize('ADMIN'), asyncHandler(courtController.remove));

export default router;