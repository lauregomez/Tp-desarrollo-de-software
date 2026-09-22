import { Request, Response } from 'express';
import { TicketStatus } from '@prisma/client';
import { AuthRequest } from '../../middlewares/auth.types';
import { ticketService } from '../ticket/ticket.service';
import { userService } from '../user/user.service';
import { paymentService } from './payment.service';
import { MAX_TICKETS_PER_USER_PER_MATCH } from '../ticket/ticket.types';
import { env } from '../../config/env';

function requireUser(req: Request) {
  const { user } = req as AuthRequest;
  if (!user) {
    throw new Error('Ruta sin middleware authenticate');
  }
  return user;
}

export const paymentController = {
  /**
   * POST /api/payments/orders
   * Body: { ticketIds: number[] }
   *
   * Crea la orden en MercadoPago y devuelve la URL del checkout.
   * Los tickets tienen que estar reservados de antemano: este endpoint
   * no crea entradas, sólo inicia el pago de las que ya existen.
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const { ticketIds } = req.body;

    if (
      !Array.isArray(ticketIds) ||
      ticketIds.length === 0 ||
      !ticketIds.every((id) => Number.isInteger(id) && id > 0)
    ) {
      res
        .status(400)
        .json({ message: 'Las entradas indicadas no son válidas' });
      return;
    }

    if (ticketIds.length > MAX_TICKETS_PER_USER_PER_MATCH) {
      res.status(400).json({
        message: `No se pueden pagar más de ${MAX_TICKETS_PER_USER_PER_MATCH} entradas juntas`,
      });
      return;
    }

    const tickets = await ticketService.findForPayment(ticketIds);

    if (tickets.length !== ticketIds.length) {
      res.status(404).json({ message: 'Alguna de las entradas no existe' });
      return;
    }

    // El userId sale del token: sin esto se podrían pagar entradas ajenas,
    // o peor, incluir ids ajenos en la orden para que el webhook los active.
    if (tickets.some((t) => t.userId !== user.userId)) {
      res.status(404).json({ message: 'Alguna de las entradas no existe' });
      return;
    }

    if (tickets.some((t) => t.status !== TicketStatus.PENDING)) {
      res
        .status(409)
        .json({ message: 'Alguna de las entradas ya fue pagada o utilizada' });
      return;
    }

    if (tickets.some((t) => t.mpOrderId !== null)) {
      res
        .status(409)
        .json({ message: 'Ya hay un pago en curso para estas entradas' });
      return;
    }

    // Una orden por partido: el external_reference no distingue partidos y
    // el precio unitario tiene que ser el mismo para todos los ítems.
    const matchId = tickets[0].matchId;
    if (tickets.some((t) => t.matchId !== matchId)) {
      res.status(400).json({
        message: 'Las entradas deben corresponder al mismo partido',
      });
      return;
    }

    const match = await ticketService.findById(tickets[0].id);
    if (!match) {
      res.status(404).json({ message: 'Alguna de las entradas no existe' });
      return;
    }

    const matchTitle = `${match.match.homeClub.name} vs ${match.match.awayClub.name}`;

    const payer = await userService.findById(user.userId);
    if (!payer) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    const order = await paymentService.createOrder({
      ticketIds,
      unitPrice: tickets[0].pricePaid.toFixed(2),
      matchTitle,
      payerEmail: env.mpTestBuyerEmail ?? payer.email,
    });

    await ticketService.attachOrder(ticketIds, order.orderId);

    res.status(201).json({ checkoutUrl: order.checkoutUrl });
  },
};