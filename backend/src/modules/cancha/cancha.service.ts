import { prisma } from '../../config/prisma';
import { CreateCanchaDto, UpdateCanchaDto } from './cancha.types';

export const canchaService = {
    async findAll() {
        return prisma.cancha.findMany();
    },
    async findById(id: number) {
        return prisma.cancha.findUnique({ where: { id } });
    },
    async create(dto: CreateCanchaDto) {
        return prisma.cancha.create({ data: dto });
    },
    async update(id: number, dto: UpdateCanchaDto) {
        return prisma.cancha.update({
            where: { id },
            data: dto,
        });
    },
    async remove(id: number) {
        return prisma.cancha.delete({ where: { id } });
    },
};