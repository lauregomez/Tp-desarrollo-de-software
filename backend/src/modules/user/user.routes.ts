import { Router } from 'express';
import { userController } from './user.controller';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';

const router = Router();

router.get('/',        authenticate, authorize('ADMIN'), asyncHandler(userController.getAll));
router.get('/:id',     authenticate, authorize('ADMIN'), asyncHandler(userController.getById));
router.post('/',       authenticate, authorize('ADMIN'), asyncHandler(userController.create));
router.put('/:id',     authenticate, authorize('ADMIN'), asyncHandler(userController.update));
router.delete('/:id',  authenticate, authorize('ADMIN'), asyncHandler(userController.remove));

export default router;