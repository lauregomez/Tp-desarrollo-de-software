import { Router } from 'express';
import { canchaController } from './cancha.controller';
import { asyncHandler } from '../../middlewares/asyncHandler';

const router = Router();

router.get('/',       asyncHandler(canchaController.getAll));
router.get('/:id',    asyncHandler(canchaController.getById));
router.post('/',      asyncHandler(canchaController.create));
router.put('/:id',    asyncHandler(canchaController.update));
router.delete('/:id', asyncHandler(canchaController.remove));

export default router;