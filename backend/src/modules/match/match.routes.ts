import { Router } from 'express';
import { matchController } from './match.controller';
import { asyncHandler } from '../../middlewares/asyncHandler';

const router = Router();

router.get('/',              asyncHandler(matchController.getAll));
router.get('/:id',           asyncHandler(matchController.getById));
router.post('/',             asyncHandler(matchController.create));
router.put('/:id',           asyncHandler(matchController.update));
router.patch('/:id/status',  asyncHandler(matchController.changeStatus));
router.delete('/:id',        asyncHandler(matchController.remove));

export default router;
