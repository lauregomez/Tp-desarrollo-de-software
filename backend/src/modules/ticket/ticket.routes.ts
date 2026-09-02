import { Router } from 'express';
import { ticketController } from './ticket.controller';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';

const router = Router();

// IMPORTANTE: /me debe declararse ANTES que /:id.
// Express matchea en orden de declaración: si /:id estuviera primero,
// una request a /api/tickets/me entraría por ahí con id = "me" y
// Number("me") daría NaN.
router.get('/me', authenticate, asyncHandler(ticketController.getMine));

// Compra: cualquier usuario autenticado.
router.post('/reserve', authenticate, asyncHandler(ticketController.reserve));

// Validación en la puerta: sólo operadores y admin.
router.post(
  '/validate',
  authenticate,
  authorize('OPERATOR', 'ADMIN'),
  asyncHandler(ticketController.validate),
);

// Listado global: sólo admin (base del reporte de recaudación).
router.get('/', authenticate, authorize('ADMIN'), asyncHandler(ticketController.getAll));

// Detalle: el control de propiedad se hace dentro del controller, porque
// depende del dueño del recurso y no sólo del rol.
router.get('/:id', authenticate, asyncHandler(ticketController.getById));

// No hay DELETE: el dominio no contempla cancelación de entradas.

export default router;
