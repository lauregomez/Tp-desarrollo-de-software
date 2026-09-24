import { prisma } from '../../config/prisma';

export const matchLogService = {
  // Lo más reciente primero. Se trae solo el nombre de quien lo registró:
  // el resto de los datos del usuario no hacen falta.
  async findAll() {
    return prisma.matchLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { name: true, lastName: true } } },
    });
  },
};