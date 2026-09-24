import { prisma } from '../../config/prisma';
import { Category, MatchStatus, Prisma, TicketStatus } from '@prisma/client';
import { CreateMatchDto, UpdateMatchDto, MatchFilters } from './match.types';

const MATCH_DURATION_MINUTES = 50;

// Argentina es UTC-3 todo el año (no tiene horario de verano desde 2009).
const ARGENTINA_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Las fechas se guardan en UTC: un partido a las 22 hs de Rosario ya es el
// día siguiente en UTC. Por eso "el mismo día" se calcula en hora argentina.
function argentinaDayRange(date: Date) {
  const local = new Date(date.getTime() - ARGENTINA_OFFSET_MS);
  const start = new Date(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) +
      ARGENTINA_OFFSET_MS,
  );
  return { start, end: new Date(start.getTime() + DAY_MS) };
}

function matchInclude() {
  return {
    homeClub: { select: { id: true, name: true, logoUrl: true } },
    awayClub: { select: { id: true, name: true, logoUrl: true } },
    court: { select: { id: true, name: true, capacity: true } },
    _count: {
      select: {
        tickets: {
          where: {
            OR: [
              { status: { in: [TicketStatus.ACTIVE, TicketStatus.USED] } },
              {
                status: TicketStatus.PENDING,
                reservedUntil: { gte: new Date() },
              },
            ],
          },
        },
      },
    },
  };
}

export const matchService = {
  async findAll(filters: MatchFilters = {}) {
    // Club y búsqueda necesitan un OR cada uno. Si los dos fueran claves OR
    // del mismo objeto, la segunda pisaría a la primera: dentro de un AND
    // se combinan sin problema.
    const conditions: Prisma.MatchWhereInput[] = [];

    if (filters.clubIds?.length) {
      conditions.push({
        OR: [
          { homeClubId: { in: filters.clubIds } },
          { awayClubId: { in: filters.clubIds } },
        ],
      });
    }

    if (filters.q) {
      conditions.push({
        OR: [
          { homeClub: { name: { contains: filters.q } } },
          { awayClub: { name: { contains: filters.q } } },
          { court: { name: { contains: filters.q } } },
        ],
      });
    }

    return prisma.match.findMany({
      where: {
        status: filters.statuses?.length ? { in: filters.statuses } : undefined,
        category: filters.category,
        courtId: filters.courtIds?.length ? { in: filters.courtIds } : undefined,
        ...((filters.from || filters.to) && {
          startsAt: {
            ...(filters.from && { gte: filters.from }),
            ...(filters.to && { lte: filters.to }),
          },
        }),
        AND: conditions,
      },
      include: matchInclude(),
      orderBy: { startsAt: 'asc' },
    });
  },

  async findById(id: number) {
    return prisma.match.findUnique({
      where: { id },
      include: matchInclude(),
    });
  },

  async create(dto: CreateMatchDto) {
    return prisma.match.create({
      data: dto,
      include: matchInclude(),
    });
  },

  async update(id: number, dto: UpdateMatchDto) {
    return prisma.match.update({
      where: { id },
      data: dto,
      include: matchInclude(),
    });
  },

  async remove(id: number) {
    return prisma.match.delete({ where: { id } });
  },

  async findCourtCapacity(courtId: number) {
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      select: { capacity: true },
    });
    return court ? court.capacity : null;
  },

  async findCourtConflict(courtId: number, startsAt: Date, excludeId?: number) {
    const durationMs = MATCH_DURATION_MINUTES * 60 * 1000;

    return prisma.match.findFirst({
      where: {
        courtId,
        status: { not: MatchStatus.CANCELLED },
        ...(excludeId && { id: { not: excludeId } }),
        startsAt: {
          gt: new Date(startsAt.getTime() - durationMs),
          lt: new Date(startsAt.getTime() + durationMs),
        },
      },
      select: { id: true, startsAt: true },
    });
  },

  async findClubDayConflict(params: {
    homeClubId: number;
    awayClubId: number;
    category: Category;
    startsAt: Date;
    excludeId?: number;
  }) {
    const { start, end } = argentinaDayRange(params.startsAt);
    const clubIds = [params.homeClubId, params.awayClubId];

    return prisma.match.findFirst({
      where: {
        category: params.category,
        status: { not: MatchStatus.CANCELLED },
        ...(params.excludeId && { id: { not: params.excludeId } }),
        startsAt: { gte: start, lt: end },
        OR: [{ homeClubId: { in: clubIds } }, { awayClubId: { in: clubIds } }],
      },
      select: { id: true },
    });
  },

};

type MatchWithRelations = NonNullable<Awaited<ReturnType<typeof matchService.findById>>>;

export function resolveCapacity(match: MatchWithRelations): number {
  // Sin cancha solo quedan partidos cuya cancha se borró, que ya están
  // finalizados o suspendidos y no venden entradas: capacidad 0.
  return match.capacity ?? match.court?.capacity ?? 0;
}

export function toPublicMatch(match: MatchWithRelations) {
  const available = resolveCapacity(match) - match._count.tickets;
  const { capacity, court, _count, ...rest } = match;

  return {
    ...rest,
    court: court ? { id: court.id, name: court.name } : null,
    soldOut: available <= 0,
  };
}

export function toAdminMatch(match: MatchWithRelations) {
  const capacity = resolveCapacity(match);
  const sold = match._count.tickets;
  const { _count, ...rest } = match;

  return {
    ...rest,
    capacity,
    sold,
    available: Math.max(0, capacity - sold),
  };
}
