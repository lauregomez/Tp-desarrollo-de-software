import { prisma } from '../../config/prisma';
import { CreateCourtDto, UpdateCourtDto } from './court.types';
import { Court, MatchStatus } from '@prisma/client';

export type RemoveCourtResult = 'OK' | 'NOT_FOUND' | 'HAS_PUBLISHED_MATCHES';

export const courtService = {
    async findAll() {
        return prisma.court.findMany();
    },
    async findById(id: number) {
        return prisma.court.findUnique({ where: { id } });
    },
    async create(dto: CreateCourtDto) {
        return prisma.court.create({ data: dto });
    },
    async update(id: number, dto: UpdateCourtDto) {
        return prisma.court.update({
            where: { id },
            data: dto,
        });
    },
    async remove(id: number): Promise<RemoveCourtResult> {
        return prisma.$transaction(async (tx) => {
            const court = await tx.court.findUnique({ where: { id }, select: { id: true } });
            if (!court) return 'NOT_FOUND';

            const published = await tx.match.count({
                where: { courtId: id, status: MatchStatus.PUBLISHED },
            });
            if (published > 0) return 'HAS_PUBLISHED_MATCHES';

            await tx.match.deleteMany({ where: { courtId: id, status: MatchStatus.DRAFT } });

            await tx.court.delete({ where: { id } });
            return 'OK';
        });
    },
};

export function toPublicCourt(court: Court) {
  const { capacity, ...rest } = court;
  return rest;
}