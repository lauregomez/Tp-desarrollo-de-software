import { Router } from 'express';
import { courtController } from './court.controller';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { sanitizeCourtInput } from './court.validations';
import { optionalAuthenticate } from '../../middlewares/optionalAuthenticate';

const router = Router();

router.get('/',        optionalAuthenticate, asyncHandler(courtController.getAll));
router.get('/:id',     optionalAuthenticate, asyncHandler(courtController.getById));
router.post('/',       authenticate, authorize('ADMIN'), sanitizeCourtInput, asyncHandler(courtController.create));
router.put('/:id',     authenticate, authorize('ADMIN'), sanitizeCourtInput, asyncHandler(courtController.update));
router.delete('/:id',  authenticate, authorize('ADMIN'), asyncHandler(courtController.remove));

export default router;