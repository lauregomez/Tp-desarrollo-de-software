import { Request, Response } from 'express';
import { TicketStatus } from '@prisma/client';
import { AuthRequest } from '../../middlewares/auth.types';
import { ReserveTicketDto, SOLD_STATUSES, TicketFilters } from './ticket.types';
import {
  ticketService,
  toOwnerTicket,
  toOperatorTicket,
} from './ticket.service';
import {
  MAX_TICKETS_PER_USER_PER_MATCH,
  ReserveFailureReason,
  ValidateFailureReason,
} from './ticket.types';

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
  MATCH_ALREADY_FINISHED: {
    status: 409,
    message: 'El partido terminó. No se pueden comprar entradas',
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

const VALIDATE_ERRORS: Record<
  ValidateFailureReason,
  { status: number; message: string }
> = {
  TICKET_NOT_FOUND: {
    status: 404,
    message: 'No existe una entrada con ese código para este partido',
  },
  TICKET_ALREADY_USED: {
    status: 409,
    message: 'La entrada ya fue utilizada',
  },
  TICKET_NOT_PAID: {
    status: 409,
    message: 'La entrada no está paga',
  },
  MATCH_NOT_PUBLISHED: {
    status: 409,
    message: 'El partido no está habilitado',
  },
};

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

   async getMine(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const { status } = req.query;

    let statusFilter: TicketStatus | TicketStatus[] = SOLD_STATUSES;
    let matchEnded: boolean | undefined;
    if (typeof status === 'string' && status !== '') {
      if (status === 'EXPIRED') {
        statusFilter = TicketStatus.ACTIVE;
        matchEnded = true;
      } else if (!SOLD_STATUSES.includes(status as TicketStatus)) {
        res.status(400).json({ message: 'El estado indicado no es válido' });
        return;
      } else {
        statusFilter = status as TicketStatus;
        if (statusFilter === TicketStatus.ACTIVE) matchEnded = false;
      }
    }

    const tickets = await ticketService.findAll({
      userId: user.userId,
      status: statusFilter,
      matchEnded,
    });

    res.json(tickets.map(toOwnerTicket));
  },

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

    if (ticket.userId !== user .userId && !isStaff(req)) {
      res.status(404).json({ message: 'Entrada no encontrada' });
      return;
    }

    res.json(isStaff(req) ? toOperatorTicket(ticket) : toOwnerTicket(ticket));
  },

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

    const normalizedCode = code.trim().toUpperCase();

    const result = await ticketService.validate(matchId, normalizedCode);

    if (!result.ok) {
      const error = VALIDATE_ERRORS[result.reason];
      res.status(error.status).json({ message: error.message, valid: false });
      return;
    }

    res.json({ valid: true, ticket: toOperatorTicket(result.data) });
  },

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