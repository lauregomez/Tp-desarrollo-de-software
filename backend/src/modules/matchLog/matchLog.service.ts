import { prisma } from '../../config/prisma';

export const matchLogService = {
  async findAll() {
    return prisma.matchLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { name: true, lastName: true } } },
    });
  },
};