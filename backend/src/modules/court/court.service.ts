import { prisma } from '../../config/prisma';
import { CreateCourtDto, UpdateCourtDto } from './court.types';
import { Court } from '@prisma/client';

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
    async remove(id: number) {
        return prisma.court.delete({ where: { id } });
    },
};

// La capacidad es un dato interno: al público se le devuelve la cancha sin ella.
export function toPublicCourt(court: Court) {
  const { capacity, ...rest } = court;
  return rest;
}