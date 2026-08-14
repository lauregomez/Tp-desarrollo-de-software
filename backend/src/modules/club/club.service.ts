import { prisma } from '../../config/prisma';
import { CreateClubDto, UpdateClubDto } from './club.types';

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

  async remove(id: number) {
    return prisma.club.delete({ where: { id } });
  },
};