import { Router } from 'express';
import { paymentController } from './payment.controller';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();

// Inicio del pago: cualquier usuario autenticado, sobre sus propias
// entradas. El control de propiedad se hace en el controller.
router.post('/orders', authenticate, asyncHandler(paymentController.createOrder));

export default router;