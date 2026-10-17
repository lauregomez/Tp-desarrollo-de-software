import { prisma } from '../../config/prisma';
import { Category, Match, MatchStatus, Prisma, TicketStatus } from '@prisma/client';
import {
  CreateMatchDto,
  UpdateMatchDto,
  MatchFilters,
  MATCH_DURATION_MINUTES,
  matchEndsAt,
} from './match.types';
import { SOLD_STATUSES } from '../ticket/ticket.types';
import { weatherService } from '../weather/weather.service';
import { MatchWeather } from '../weather/weather.types';

const ARGENTINA_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function argentinaDayRange(date: Date) {
  const local = new Date(date.getTime() - ARGENTINA_OFFSET_MS);
  const start = new Date(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) +
      ARGENTINA_OFFSET_MS,
  );
  return { start, end: new Date(start.getTime() + DAY_MS) };
}

const CATEGORY_LABEL: Record<Category, string> = {
  PRIMERA: 'Primera',
  RESERVA: 'Reserva',
  CUARTA: 'Cuarta',
  QUINTA: 'Quinta',
};

const LOGGED_STATUS_LABEL: Partial<Record<MatchStatus, string>> = {
  FINISHED: 'Finalizado',
  CANCELLED: 'Suspendido',
};

type LoggableMatch = {
  status: MatchStatus;
  startsAt: Date;
  category: Category;
  homeClub: { name: string } | null;
  awayClub: { name: string } | null;
  court: { name: string } | null;
};

function describeMatch(match: LoggableMatch): string {
  const date = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(match.startsAt);

  const home = match.homeClub?.name ?? 'Club eliminado';
  const away = match.awayClub?.name ?? 'Club eliminado';
  const court = match.court?.name ?? 'Cancha eliminada';

  return `${LOGGED_STATUS_LABEL[match.status]}: ${home} contra ${away} · ${CATEGORY_LABEL[match.category]} · ${date} · ${court}`;
}

function matchInclude() {
  return {
    homeClub: { select: { id: true, name: true, logoUrl: true } },
    awayClub: { select: { id: true, name: true, logoUrl: true } },
    court: { select: { id: true, name: true, address: true, capacity: true } },
    _count: {
      select: {
        tickets: { where: { status: { in: SOLD_STATUSES } } },
      },
    },
  };
}

export const matchService = {
  async findAll(filters: MatchFilters = {}) {
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

  async changeStatus(id: number, status: MatchStatus, userId: number) {
    return prisma.$transaction(async (tx) => {
      const match = await tx.match.update({
        where: { id },
        data: { status },
        include: matchInclude(),
      });

      if (LOGGED_STATUS_LABEL[status]) {
        await tx.matchLog.create({
          data: {
            description: describeMatch(match),
            matchId: id,
            createdById: userId,
          },
        });
      }

      return match;
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

  async getWeather(match: Pick<Match, 'status' | 'startsAt'>): Promise<MatchWeather> {
    if (
      match.status === MatchStatus.CANCELLED ||
      match.status === MatchStatus.FINISHED ||
      matchEndsAt(match.startsAt).getTime() < Date.now()
    ) {
      return { status: 'UNAVAILABLE' };
    }

    return weatherService.getWeatherAt(match.startsAt);
  },

};

type MatchWithRelations = NonNullable<Awaited<ReturnType<typeof matchService.findById>>>;

export function resolveCapacity(match: MatchWithRelations): number {
  return match.capacity ?? match.court?.capacity ?? 0;
}

export function toPublicMatch(match: MatchWithRelations) {
  const available = resolveCapacity(match) - match._count.tickets;
  const { capacity, court, _count, ...rest } = match;

  return {
    ...rest,
    court: court ? { id: court.id, name: court.name, address: court.address } : null,
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
