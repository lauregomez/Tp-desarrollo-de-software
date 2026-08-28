import { Router } from 'express';
import { userController } from './user.controller';
import { asyncHandler } from '../../middlewares/asyncHandler';

const router = Router();

router.get('/',        asyncHandler(userController.getAll));
router.get('/:id',     asyncHandler(userController.getById));
router.post('/',       asyncHandler(userController.create));
router.put('/:id',     asyncHandler(userController.update));
router.delete('/:id',  asyncHandler(userController.remove));

export default router;