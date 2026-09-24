import { prisma } from '../../config/prisma';
import { CreateCourtDto, UpdateCourtDto } from './court.types';
import { Court, MatchStatus } from '@prisma/client';

// Resultado del borrado: el controller decide qué código HTTP corresponde.
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
    // Con onDelete: SetNull la base ya no impide borrar una cancha con partidos,
    // así que la regla vive acá. Todo va en una transacción: si algo falla,
    // no queda nada a medias.
    async remove(id: number): Promise<RemoveCourtResult> {
        return prisma.$transaction(async (tx) => {
            const court = await tx.court.findUnique({ where: { id }, select: { id: true } });
            if (!court) return 'NOT_FOUND';

            // Un partido publicado ya puede tener entradas vendidas: no se toca.
            const published = await tx.match.count({
                where: { courtId: id, status: MatchStatus.PUBLISHED },
            });
            if (published > 0) return 'HAS_PUBLISHED_MATCHES';

            // Los borradores nunca se jugaron ni vendieron: se borran con la cancha.
            await tx.match.deleteMany({ where: { courtId: id, status: MatchStatus.DRAFT } });

            // Los finalizados y suspendidos quedan con courtId en null (SetNull).
            await tx.court.delete({ where: { id } });
            return 'OK';
        });
    },
};

// La capacidad es un dato interno: al público se le devuelve la cancha sin ella.
export function toPublicCourt(court: Court) {
  const { capacity, ...rest } = court;
  return rest;
}