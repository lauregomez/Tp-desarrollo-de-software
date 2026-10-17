import { prisma } from '../../config/prisma';
import { CreateClubDto, UpdateClubDto } from './club.types';
import { MatchStatus } from '@prisma/client';

export type RemoveClubResult = 'OK' | 'NOT_FOUND' | 'HAS_PUBLISHED_MATCHES';

export const clubService = {
  async findAll() {
    return prisma.club.findMany();
  },

  async findById(id: number) {
    return prisma.club.findUnique({ where: { id } });
  },

  async create(dto: CreateClubDto) {
    return prisma.club.create({ data: dto });
  },

  async update(id: number, dto: UpdateClubDto) {
    return prisma.club.update({
      where: { id },
      data: dto,
    });
  },

  async remove(id: number): Promise<RemoveClubResult> {
    return prisma.$transaction(async (tx) => {
      const club = await tx.club.findUnique({ where: { id }, select: { id: true } });
      if (!club) return 'NOT_FOUND';

      const courts = await tx.court.findMany({ where: { clubId: id }, select: { id: true } });
      const courtIds = courts.map((court) => court.id);

      const clubMatches = {
        OR: [{ homeClubId: id }, { awayClubId: id }, { courtId: { in: courtIds } }],
      };

      const published = await tx.match.count({
        where: { ...clubMatches, status: MatchStatus.PUBLISHED },
      });
      if (published > 0) return 'HAS_PUBLISHED_MATCHES';

      await tx.match.deleteMany({ where: { ...clubMatches, status: MatchStatus.DRAFT } });
      await tx.court.deleteMany({ where: { clubId: id } });
      await tx.club.delete({ where: { id } });
      return 'OK';
    });
  },
};