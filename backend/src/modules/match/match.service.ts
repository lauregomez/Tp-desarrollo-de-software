import { prisma } from '../../config/prisma';
import { MatchStatus } from '@prisma/client';
import { CreateMatchDto, UpdateMatchDto, MatchFilters } from './match.types';


const MATCH_DURATION_MINUTES = 50;


const MATCH_INCLUDE = {
  homeClub: { select: { id: true, name: true } },
  awayClub: { select: { id: true, name: true } },
  court: { select: { id: true, name: true, capacity: true } },
  _count: { select: { tickets: true } },
};

export const matchService = {
  async findAll(filters: MatchFilters = {}) {
    return prisma.match.findMany({
      where: {
        status: filters.status,
        category: filters.category,
        ...(filters.clubId && {
          OR: [{ homeClubId: filters.clubId }, { awayClubId: filters.clubId }],
        }),
        ...((filters.from || filters.to) && {
          startsAt: {
            ...(filters.from && { gte: filters.from }),
            ...(filters.to && { lte: filters.to }),
          },
        }),
      },
      include: MATCH_INCLUDE,
      orderBy: { startsAt: 'asc' },
    });
  },

  async findById(id: number) {
    return prisma.match.findUnique({
      where: { id },
      include: MATCH_INCLUDE,
    });
  },

  async create(dto: CreateMatchDto) {
    return prisma.match.create({
      data: dto,
      include: MATCH_INCLUDE,
    });
  },

  async update(id: number, dto: UpdateMatchDto) {
    return prisma.match.update({
      where: { id },
      data: dto,
      include: MATCH_INCLUDE,
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
};

type MatchWithRelations = NonNullable<Awaited<ReturnType<typeof matchService.findById>>>;


export function resolveCapacity(match: MatchWithRelations): number {
  return match.capacity ?? match.court.capacity;
}


export function toPublicMatch(match: MatchWithRelations) {
  const available = resolveCapacity(match) - match._count.tickets;
  const { capacity, court, _count, ...rest } = match;

  return {
    ...rest,
    court: { id: court.id, name: court.name },
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
