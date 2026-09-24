import { Request, Response } from 'express';
import { TicketStatus } from '@prisma/client';
import { AuthRequest } from '../../middlewares/auth.types';
import { ticketService } from '../ticket/ticket.service';
import { userService } from '../user/user.service';
import { paymentService } from './payment.service';
import { WebhookNotification } from './payment.types';
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

  /**
   * POST /api/payments/webhook
   *
   * Notificación de MercadoPago. No lleva authenticate: la autenticidad se
   * establece con la firma, no con un token propio.
   *
   * Criterio de códigos: todo lo que no tenga arreglo reintentando responde
   * 200 y queda en el log. Sólo los fallos transitorios se dejan propagar
   * para que el errorHandler devuelva 500 y MercadoPago vuelva a notificar.
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    // La firma se verifica antes que nada: hasta confirmar el origen, nada
    // de lo que llega es confiable.
        // TEMPORAL: diagnóstico de la firma. Borrar antes de commitear.
    const dataId = req.query['data.id'];
    const check = paymentService.verifyWebhookSignature({
      xSignature: req.headers['x-signature'],
      xRequestId: req.headers['x-request-id'],
      dataId: typeof dataId === 'string' ? dataId : undefined,
    });

    if (!check.valid) {
      // Se loguean el motivo y el x-request-id, que es lo que identifica a la
      // notificación en el panel de MercadoPago. La firma recibida no se
      // loguea nunca.
      console.error(
        '[webhook] firma rechazada:',
        check.reason,
        '- x-request-id:',
        req.headers['x-request-id'] ?? '(sin request id)',
      );
      res.status(401).end();
      return;
    }

    const notification = req.body as WebhookNotification;

    // Sólo interesan las órdenes. El resto se acepta para que MercadoPago
    // deje de reintentarlas, pero queda registrado: sin esta línea, una
    // notificación de tipo inesperado se descarta sin dejar rastro.
    if (notification?.type !== 'order') {
      console.log('[webhook] notificación ignorada, tipo:', notification?.type);
      res.status(200).end();
      return;
    }

    if (typeof dataId !== 'string' || dataId.length === 0) {
      console.error('[webhook] notificación de orden sin data.id');
      res.status(200).end();
      return;
    }

    // El body podría estar adulterado: la orden se pide a MercadoPago.
    const order = await paymentService.getOrder(dataId);

    if (!order) {
      console.error('[webhook] la orden no existe en MercadoPago:', dataId);
      res.status(200).end();
      return;
    }

    // El id de la orden se resuelve acá porque lo necesitan tanto el camino
    // de confirmación como el de liberación.
    const orderId = order.id;

    if (!orderId) {
      console.error('[webhook] la orden llegó sin id:', dataId);
      res.status(200).end();
      return;
    }

    const action = notification.action;

    // Un reembolso supone una entrada ya confirmada, con código emitido y quizás
    // ya usada en la puerta. Revertirlo no es simétrico a liberar una reserva:
    // hay que decidir qué pasa con el acceso al partido y con el dinero, y eso
    // excede al webhook. Queda registrado para revisión manual.
    if (action === 'order.refunded') {
      console.error(
        '[webhook] orden reembolsada, requiere revisión manual:',
        orderId,
      );
      res.status(200).end();
      return;
    }

    if (action === 'order.canceled' || action === 'order.expired') {
      // El action viaja en el body y el body no entra en la firma: antes de
      // borrar nada se confirma el desenlace contra el estado que devolvió
      // MercadoPago. Sin esto, reenviar una notificación legítima con el
      // cuerpo cambiado alcanzaría para voltear una reserva en curso.
      //
      // No se compara contra literales exactos porque no está garantizada la
      // grafía que usa MercadoPago (canceled/cancelled). El prefijo alcanza
      // para distinguir un final de fracaso de una orden todavía viva
      // (created, action_required) o ya pagada (processed).
      const status = (order.status ?? '').toLowerCase();
      const failed = status.startsWith('cancel') || status.startsWith('expir');

      if (!failed) {
        console.error(
          `[webhook] ${action} pero la orden ${orderId} figura en ${order.status}`,
        );
        res.status(200).end();
        return;
      }

      const released = await ticketService.releaseByOrderId(orderId);

      console.log(
        `[webhook] orden ${orderId} (${action}): ${released} entradas liberadas`,
      );
      res.status(200).end();
      return;
    }

    // Sólo un pago acreditado habilita las entradas.
    if (order.status !== 'processed' || order.status_detail !== 'accredited') {
      console.log(
        `[webhook] orden ${dataId} sin acreditar (${order.status}/${order.status_detail})`,
      );
      res.status(200).end();
      return;
    }

    const paymentId = order.transactions?.payments?.[0]?.id;

    if (!paymentId) {
      console.error('[webhook] orden acreditada sin id de pago:', dataId);
      res.status(200).end();
      return;
    }

    // La base es la que sabe qué entradas cubre la orden.
    const tickets = await ticketService.findByOrderId(orderId);

    if (tickets.length === 0) {
      console.error('[webhook] no hay entradas para la orden:', orderId);
      res.status(200).end();
      return;
    }

    // El external_reference llega en la notificación y podría no reflejar lo
    // guardado: si no coincide con la base, no se confirma nada.
    const referenced = (order.external_reference ?? '')
      .split('-')
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0);

    const ticketIds = tickets.map((t) => t.id);
    const sameTickets =
      referenced.length === ticketIds.length &&
      ticketIds.every((id) => referenced.includes(id));

    if (!sameTickets) {
      console.error(
        `[webhook] la orden ${orderId} no coincide con las entradas guardadas`,
      );
      res.status(200).end();
      return;
    }

    // confirmPayment sólo toca las PENDING: en un reintento no queda nada por
    // confirmar y no se regeneran los códigos ya emitidos.
    const confirmed = await ticketService.confirmPayment(ticketIds, paymentId);

    console.log(
      confirmed.length > 0
        ? `[webhook] orden ${orderId}: ${confirmed.length} entradas confirmadas`
        : `[webhook] orden ${orderId}: ya estaba confirmada`,
    );

    res.status(200).end();
  },
};