import { Router } from 'express';
import { paymentController } from './payment.controller';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();

// Inicio del pago: cualquier usuario autenticado, sobre sus propias
// entradas. El control de propiedad se hace en el controller.
router.post('/orders', authenticate, asyncHandler(paymentController.createOrder));

// Notificación de MercadoPago: va sin authenticate porque quien llama es
// MercadoPago, no un usuario de la aplicación. La autenticidad se establece
// con la firma del header x-signature, que valida el controller.
router.post('/webhook', asyncHandler(paymentController.handleWebhook));

export default router;