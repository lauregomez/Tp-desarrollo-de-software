import { Request, Response } from 'express';
import { Prisma, TicketStatus, MatchStatus } from '@prisma/client';
import { AuthRequest } from '../../middlewares/auth.types';
import {
  ticketService,
  toOwnerTicket,
  toOperatorTicket,
} from './ticket.service';
import {
  MAX_TICKETS_PER_USER_PER_MATCH,
  ReserveFailureReason,
} from './ticket.types';

/**
 * Traduce los motivos de fallo del service a respuestas HTTP.
 * Tenerlo como tabla evita una cadena de if/else en el controller y, al
 * estar tipado con Record<ReserveFailureReason, ...>, TypeScript obliga a
 * contemplar todos los motivos: si mañana se agrega uno nuevo al tipo,
 * la compilación falla hasta que se agregue acá también.
 */
const RESERVE_ERRORS: Record<
  ReserveFailureReason,
  { status: number; message: string }
> = {
  MATCH_NOT_FOUND: {
    status: 404,
    message: 'Partido no encontrado',
  },
  MATCH_NOT_PUBLISHED: {
    status: 409,
    message: 'El partido no está disponible para la venta',
  },
  MATCH_ALREADY_STARTED: {
    status: 409,
    message: 'El partido ya comenzó',
  },
  USER_LIMIT_EXCEEDED: {
    status: 409,
    message: `No se pueden comprar más de ${MAX_TICKETS_PER_USER_PER_MATCH} entradas por partido`,
  },
  NOT_ENOUGH_CAPACITY: {
    status: 409,
    message: 'No hay entradas suficientes disponibles',
  },
};

/**
 * Extrae el usuario autenticado del request.
 * Todas las rutas de este módulo pasan por `authenticate`, así que si no
 * hay usuario es un error de programación (una ruta mal configurada), no
 * una entrada inválida del cliente. Por eso lanza en vez de responder 401.
 */
function requireUser(req: Request) {
  const { user } = req as AuthRequest;
  if (!user) {
    throw new Error('Ruta sin middleware authenticate');
  }
  return user;
}

function isStaff(req: Request): boolean {
  const { user } = req as AuthRequest;
  return user?.role === 'ADMIN' || user?.role === 'OPERATOR';
}

export const ticketController = {
  /**
   * POST /api/tickets/reserve
   * Body: { matchId, quantity }
   *
   * El userId NUNCA se toma del body: sale del token. Si viniera del
   * cliente, cualquiera podría reservar entradas a nombre de otro.
   */
  async reserve(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const { matchId, quantity } = req.body;

    if (!Number.isInteger(matchId) || matchId <= 0) {
      res.status(400).json({ message: 'El partido indicado no es válido' });
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      res
        .status(400)
        .json({ message: 'La cantidad debe ser un número entero positivo' });
      return;
    }

    if (quantity > MAX_TICKETS_PER_USER_PER_MATCH) {
      res.status(400).json({
        message: `No se pueden comprar más de ${MAX_TICKETS_PER_USER_PER_MATCH} entradas por partido`,
      });
      return;
    }

    const result = await ticketService.reserve({
      userId: user.userId,
      matchId,
      quantity,
    });

    if (!result.ok) {
      const error = RESERVE_ERRORS[result.reason];
      res.status(error.status).json({ message: error.message });
      return;
    }

    res.status(201).json(result.data.map(toOwnerTicket));
  },

  /**
   * GET /api/tickets/me?status=ACTIVE
   * Listado con filtro requerido por el enunciado.
   * El userId sale siempre del token, nunca del query string.
   */
  async getMine(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const { status } = req.query;

    let statusFilter: TicketStatus | undefined;
    if (typeof status === 'string' && status !== '') {
      if (!Object.values(TicketStatus).includes(status as TicketStatus)) {
        res.status(400).json({ message: 'El estado indicado no es válido' });
        return;
      }
      statusFilter = status as TicketStatus;
    }

    const tickets = await ticketService.findAll({
      userId: user .userId,
      status: statusFilter,
    });

    res.json(tickets.map(toOwnerTicket));
  },

  /**
   * GET /api/tickets/:id
   * Detalle de la entrada, incluye el code para armar el QR.
   */
  async getById(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'El id debe ser un número' });
      return;
    }

    const ticket = await ticketService.findById(id);

    if (!ticket) {
      res.status(404).json({ message: 'Entrada no encontrada' });
      return;
    }

    // Control de propiedad: un usuario sólo ve sus propias entradas.
    // Sin esto, cambiando el id en la URL se vería el QR ajeno, que es
    // equivalente a robarle la entrada.
    // Se responde 404 y no 403 para no revelar que la entrada existe.
    if (ticket.userId !== user .userId && !isStaff(req)) {
      res.status(404).json({ message: 'Entrada no encontrada' });
      return;
    }

    res.json(isStaff(req) ? toOperatorTicket(ticket) : toOwnerTicket(ticket));
  },

  /**
   * POST /api/tickets/validate
   * Body: { code, matchId }
   *
   * Escaneo del QR en la puerta. `matchId` es el partido que el operador
   * está atendiendo: sirve para rechazar entradas de otra fecha.
   * Devuelve siempre un campo `valid` para que el frontend del operador
   * muestre verde o rojo sin interpretar el status code.
   */
  async validate(req: Request, res: Response): Promise<void> {
    const { code, matchId } = req.body;

    if (typeof code !== 'string' || code.trim() === '') {
      res
        .status(400)
        .json({ message: 'El código de la entrada es obligatorio', valid: false });
      return;
    }

    if (!Number.isInteger(matchId) || matchId <= 0) {
      res
        .status(400)
        .json({ message: 'El partido indicado no es válido', valid: false });
      return;
    }

    const ticket = await ticketService.findByCode(code.trim());

    if (!ticket) {
      res.status(404).json({ message: 'Entrada inexistente', valid: false });
      return;
    }

    if (ticket.matchId !== matchId) {
      res
        .status(409)
        .json({ message: 'La entrada corresponde a otro partido', valid: false });
      return;
    }

    if (ticket.status === TicketStatus.USED) {
      res
        .status(409)
        .json({ message: 'La entrada ya fue utilizada', valid: false });
      return;
    }

    if (ticket.status !== TicketStatus.ACTIVE) {
      res.status(409).json({ message: 'La entrada no está paga', valid: false });
      return;
    }

    if (ticket.match.status !== MatchStatus.PUBLISHED) {
      res
        .status(409)
        .json({ message: 'El partido no está habilitado', valid: false });
      return;
    }

    try {
      const used = await ticketService.markAsUsed(ticket.id);
      res.json({ valid: true, ticket: toOperatorTicket(used) });
    } catch (error) {
      // P2025: otro operador la marcó como usada entre el chequeo y el update.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        res
          .status(409)
          .json({ message: 'La entrada ya fue utilizada', valid: false });
        return;
      }
      throw error;
    }
  },

  /**
   * GET /api/tickets?matchId=1&status=ACTIVE
   * Sólo ADMIN. Base del reporte de recaudación por partido.
   */
  async getAll(req: Request, res: Response): Promise<void> {
    const { matchId, status } = req.query;

    let matchFilter: number | undefined;
    if (typeof matchId === 'string' && matchId !== '') {
      matchFilter = Number(matchId);
      if (!Number.isInteger(matchFilter) || matchFilter <= 0) {
        res.status(400).json({ message: 'El partido indicado no es válido' });
        return;
      }
    }

    let statusFilter: TicketStatus | undefined;
    if (typeof status === 'string' && status !== '') {
      if (!Object.values(TicketStatus).includes(status as TicketStatus)) {
        res.status(400).json({ message: 'El estado indicado no es válido' });
        return;
      }
      statusFilter = status as TicketStatus;
    }

    const tickets = await ticketService.findAll({
      matchId: matchFilter,
      status: statusFilter,
    });

    res.json(tickets);
  },
};
