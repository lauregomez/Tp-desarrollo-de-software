import bcrypt from 'bcrypt';
import { prisma } from '../../config/prisma';
import { CreateUserDto, UpdateUserDto } from './user.types';

const SALT_ROUNDS = 10;

const publicFields = {
  id: true,
  name: true,
  lastName: true,
  email: true,
  roleId: true,
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
        roleId: dto.roleId,
        passwordHash,
      },
      select: publicFields,
    });
  },

  async update(id: number, dto: UpdateUserDto) {
    return prisma.user.update({
      where: { id },
      data: dto,
      select: publicFields,
    });
  },

  async remove(id: number) {
    return prisma.user.delete({ where: { id } });
  },
};