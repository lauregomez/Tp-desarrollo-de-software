import { Router } from 'express';
import { ticketController } from './ticket.controller';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';

const router = Router();

router.get('/me', authenticate, asyncHandler(ticketController.getMine));

router.post('/reserve', authenticate, asyncHandler(ticketController.reserve));

router.post(
  '/validate',
  authenticate,
  authorize('OPERATOR', 'ADMIN'),
  asyncHandler(ticketController.validate),
);

router.get('/', authenticate, authorize('ADMIN'), asyncHandler(ticketController.getAll));

router.get('/:id', authenticate, asyncHandler(ticketController.getById));

export default router;
