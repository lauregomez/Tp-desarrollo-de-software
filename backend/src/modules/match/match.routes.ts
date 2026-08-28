import { Router } from 'express';
import { matchController } from './match.controller';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { optionalAuthenticate } from '../../middlewares/optionalAuthenticate';

const router = Router();

router.get('/',              optionalAuthenticate, asyncHandler(matchController.getAll));
router.get('/:id',           optionalAuthenticate, asyncHandler(matchController.getById));
router.post('/',             authenticate, authorize('ADMIN'), asyncHandler(matchController.create));
router.put('/:id',           authenticate, authorize('ADMIN'), asyncHandler(matchController.update));
router.patch('/:id/status',  authenticate, authorize('ADMIN'), asyncHandler(matchController.changeStatus));
router.delete('/:id',        authenticate, authorize('ADMIN'), asyncHandler(matchController.remove));

export default router;
