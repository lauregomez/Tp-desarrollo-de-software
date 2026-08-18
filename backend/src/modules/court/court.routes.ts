import { Router } from 'express';
import { courtController } from './court.controller';
import { asyncHandler } from '../../middlewares/asyncHandler';

const router = Router();

router.get('/',       asyncHandler(courtController.getAll));
router.get('/:id',    asyncHandler(courtController.getById));
router.post('/',      asyncHandler(courtController.create));
router.put('/:id',    asyncHandler(courtController.update));
router.delete('/:id', asyncHandler(courtController.remove));

export default router;