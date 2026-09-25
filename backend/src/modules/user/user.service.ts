import bcrypt from 'bcryptjs';
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
  
   /**
   * Cuenta los usuarios con rol ADMIN.
   *
   * Busca el rol por nombre y no por id: los ids los asigna la base
   * (autoincrement) y sólo coinciden con 1/2/3 por cómo los carga el
   * seed. El nombre es lo estable.
   */

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

  /**
   * Traduce el nombre de un rol a su id.
   *
   * Hace falta porque el contrato de la API todavía habla en ids
   * (roleId), pero las reglas de negocio razonan en nombres: el id que
   * tiene ADMIN depende de cómo se cargó la base.
   */
  async findRoleIdByName(name: string): Promise<number | null> {
    const role = await prisma.role.findUnique({
      where: { name },
      select: { id: true },
    });
    return role?.id ?? null;
  },
};

