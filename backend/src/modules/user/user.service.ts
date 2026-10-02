import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { CreateUserDto, UpdateUserDto } from './user.types';
import { TicketStatus } from '@prisma/client';

const SALT_ROUNDS = 10;

const publicFields = {
  id: true,
  name: true,
  lastName: true,
  email: true,
  role: { select: { name: true } },
  isActive: true,
  createdAt: true,
} as const;

export const userService = {
  async findAll() {
    return prisma.user.findMany({
      select: publicFields,
      orderBy: { lastName: 'asc' },
    });
  },

  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: publicFields,
    });
  },

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    return prisma.user.create({
      data: {
        name: dto.name,
        lastName: dto.lastName,
        email: dto.email,
        role: { connect: { name: dto.role } },
        passwordHash,
      },
      select: publicFields,
    });
  },

  async update(id: number, dto: UpdateUserDto) {
    return prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        lastName: dto.lastName,
        email: dto.email,
        // Sólo se toca el rol si vino en el DTO: el update es parcial.
        ...(dto.role !== undefined && {
          role: { connect: { name: dto.role } },
        }),
      },
      select: publicFields,
    });
  },

  
  async countAdmins(): Promise<number> {
    return prisma.user.count({
      where: { role: { name: 'ADMIN' } },
    });
  },

   /**
   * Devuelve el nombre del rol de un usuario, o null si no existe.
   * Se usa para saber si la operación afecta a un ADMIN antes de
   * ejecutarla.
   */
  
  async findRoleName(id: number): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { role: { select: { name: true } } },
    });
    return user?.role.name ?? null;
  },


    async countUnusedTickets(userId: number): Promise<number> {
    return prisma.ticket.count({
      where: {
        userId,
        status: { in: [TicketStatus.PENDING, TicketStatus.ACTIVE] },
      },
    });
  },
  
    async deactivate(id: number) {
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: publicFields,
    });
  },
  
    async activate(id: number) {
    return prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: publicFields,
    });
  },

};

