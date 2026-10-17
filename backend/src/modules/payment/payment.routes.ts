import { Router } from 'express';
import { paymentController } from './payment.controller';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();

router.post('/orders', authenticate, asyncHandler(paymentController.createOrder));

router.post('/webhook', asyncHandler(paymentController.handleWebhook));

export default router;