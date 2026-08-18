import { Router } from 'express';
import { clubController } from './club.controller';
import { asyncHandler } from '../../middlewares/asyncHandler';

const router = Router();

router.get('/',       asyncHandler(clubController.getAll));
router.get('/:id',    asyncHandler(clubController.getById));
router.post('/',      asyncHandler(clubController.create));
router.put('/:id',    asyncHandler(clubController.update));
router.delete('/:id', asyncHandler(clubController.remove));

export default router;