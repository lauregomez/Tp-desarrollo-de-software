import { randomInt } from 'node:crypto';
import { prisma } from '../../config/prisma';
import { MatchStatus, TicketStatus, Prisma } from '@prisma/client';
import {
  CreateTicketDto,
  UpdateTicketDto,
  ReserveTicketDto,
  TicketFilters,
  ReserveFailureReason,
  ServiceResult,
  MAX_TICKETS_PER_USER_PER_MATCH,
  SOLD_STATUSES,
  ValidateFailureReason,
} from './ticket.types';
import { matchEndsAt, endedMatchCutoff } from '../match/match.types';

const TICKET_INCLUDE = {
  match: {
    include: {
      homeClub: { select: { id: true, name: true } },
      awayClub: { select: { id: true, name: true } },
      court: { select: { id: true, name: true, address: true } },
    },
  },
  user: { select: { id: true, name: true, lastName: true, email: true } },
} satisfies Prisma.TicketInclude;

export type TicketWithRelations = Prisma.TicketGetPayload<{
  include: typeof TICKET_INCLUDE;
}>;


const CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 4;
const MAX_CODE_ATTEMPTS = 5;

function generateCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

async function generateUniqueCode(
  tx: Prisma.TransactionClient,
  matchId: number,
): Promise<string> {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const code = generateCode();
    const taken = await tx.ticket.findFirst({
      where: { matchId, code },
      select: { id: true },
    });
    if (!taken) return code;
  }
  throw new Error('No se pudo generar un código único para la entrada');
}

export const ticketService = {
  async findAll(filters: TicketFilters = {}): Promise<TicketWithRelations[]> {
    const cutoff = endedMatchCutoff();

    return prisma.ticket.findMany({
      where: {
        userId: filters.userId,
        matchId: filters.matchId,
        status: Array.isArray(filters.status)
          ? { in: filters.status }
          : filters.status,
        ...(filters.matchEnded !== undefined && {
          match: {
            startsAt: filters.matchEnded ? { lte: cutoff } : { gt: cutoff },
          },
        }),
      },
      include: TICKET_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: number): Promise<TicketWithRelations | null> {
    return prisma.ticket.findUnique({
      where: { id },
      include: TICKET_INCLUDE,
    });
  },

  async findByCode(
    matchId: number,
    code: string,
  ): Promise<TicketWithRelations | null> {
    return prisma.ticket.findUnique({
      where: { matchId_code: { matchId, code } },
      include: TICKET_INCLUDE,
    });
  },

  async reserve(
    dto: ReserveTicketDto,
  ): Promise<ServiceResult<TicketWithRelations[], ReserveFailureReason>> {
    return prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { id: dto.matchId },
        include: { court: { select: { capacity: true } } },
      });

      if (!match) {
        return { ok: false as const, reason: 'MATCH_NOT_FOUND' as const };
      }

      if (match.status !== MatchStatus.PUBLISHED) {
        return { ok: false as const, reason: 'MATCH_NOT_PUBLISHED' as const };
      }

      if (matchEndsAt(match.startsAt).getTime() <= Date.now()) {
        return { ok: false as const, reason: 'MATCH_ALREADY_FINISHED' as const };
      }

      const userTickets = await tx.ticket.count({
        where: {
          userId: dto.userId,
          matchId: dto.matchId,
          status: { in: SOLD_STATUSES },
        },
      });

      if (userTickets + dto.quantity > MAX_TICKETS_PER_USER_PER_MATCH) {
        return { ok: false as const, reason: 'USER_LIMIT_EXCEEDED' as const };
      }

      const capacity = match.capacity ?? match.court?.capacity ?? 0;
      const occupied = await tx.ticket.count({
        where: { matchId: dto.matchId, status: { in: SOLD_STATUSES } },
      });

      if (occupied + dto.quantity > capacity) {
        return { ok: false as const, reason: 'NOT_ENOUGH_CAPACITY' as const };
      }

      const created: TicketWithRelations[] = [];

      for (let i = 0; i < dto.quantity; i++) {
        const ticket = await tx.ticket.create({
          data: {
            userId: dto.userId,
            matchId: dto.matchId,
            pricePaid: match.price,
            status: TicketStatus.PENDING,
          },
          include: TICKET_INCLUDE,
        });
        created.push(ticket);
      }

      return { ok: true as const, data: created };
    });
  },

  async confirmPayment(
    ticketIds: number[],
    mpPaymentId: string,
  ): Promise<TicketWithRelations[]> {
    return prisma.$transaction(async (tx) => {
      const pending = await tx.ticket.findMany({
        where: {
          id: { in: ticketIds },
          status: TicketStatus.PENDING,
        },
        select: { id: true, matchId: true },
      });

      const confirmed: TicketWithRelations[] = [];

      for (const { id, matchId } of pending) {
        const { count } = await tx.ticket.updateMany({
          where: { id, status: TicketStatus.PENDING },
          data: {
            status: TicketStatus.ACTIVE,
            code: await generateUniqueCode(tx, matchId),
            mpPaymentId,
          },
        });

        if (count === 0) continue;

        const ticket = await tx.ticket.findUniqueOrThrow({
          where: { id },
          include: TICKET_INCLUDE,
        });
        confirmed.push(ticket);
      }

      return confirmed;
    });
  },

  async findForPayment(ticketIds: number[]) {
    return prisma.ticket.findMany({
      where: { id: { in: ticketIds } },
      select: {
        id: true,
        userId: true,
        matchId: true,
        status: true,
        pricePaid: true,
        mpOrderId: true,
      },
    });
  },

  async attachOrder(ticketIds: number[], mpOrderId: string): Promise<number> {
    const { count } = await prisma.ticket.updateMany({
      where: { id: { in: ticketIds }, status: TicketStatus.PENDING },
      data: { mpOrderId },
    });
    return count;
  },

  async findByOrderId(mpOrderId: string) {
    return prisma.ticket.findMany({
      where: { mpOrderId },
      select: { id: true, status: true },
    });
  },

  async releaseByOrderId(mpOrderId: string): Promise<number> {
    const { count } = await prisma.ticket.deleteMany({
      where: { mpOrderId, status: TicketStatus.PENDING },
    });
    return count;
  },

  async markAsUsed(id: number): Promise<TicketWithRelations> {
    return prisma.ticket.update({
      where: { id, status: TicketStatus.ACTIVE },
      data: { status: TicketStatus.USED },
      include: TICKET_INCLUDE,
    });
  },

  async validate(
    matchId: number,
    code: string,
  ): Promise<ServiceResult<TicketWithRelations, ValidateFailureReason>> {
    const ticket = await this.findByCode(matchId, code);

    if (!ticket) {
      return { ok: false, reason: 'TICKET_NOT_FOUND' };
    }
    if (ticket.status === TicketStatus.USED) {
      return { ok: false, reason: 'TICKET_ALREADY_USED' };
    }
    if (ticket.status !== TicketStatus.ACTIVE) {
      return { ok: false, reason: 'TICKET_NOT_PAID' };
    }
    if (ticket.match.status !== MatchStatus.PUBLISHED) {
      return { ok: false, reason: 'MATCH_NOT_PUBLISHED' };
    }

    try {
      const used = await this.markAsUsed(ticket.id);
      return { ok: true, data: used };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return { ok: false, reason: 'TICKET_ALREADY_USED' };
      }
      throw error;
    }
  },

  async create(dto: CreateTicketDto): Promise<TicketWithRelations> {
    return prisma.ticket.create({ data: dto, include: TICKET_INCLUDE });
  },

  async update(id: number, dto: UpdateTicketDto): Promise<TicketWithRelations> {
    return prisma.ticket.update({
      where: { id },
      data: dto,
      include: TICKET_INCLUDE,
    });
  },
};

export function toOwnerTicket(ticket: TicketWithRelations) {
  const { user, ...rest } = ticket;
  const expired =
    ticket.status === TicketStatus.ACTIVE &&
    matchEndsAt(ticket.match.startsAt).getTime() <= Date.now();

  return { ...rest, expired };
}

export function toOperatorTicket(ticket: TicketWithRelations) {
  const { mpPaymentId, pricePaid, ...rest } = ticket;
  return rest;
}