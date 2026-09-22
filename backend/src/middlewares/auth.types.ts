import { Request } from 'express';

// Nombres de rol válidos, espejo de la tabla roles del seed.
// Los roles son una tabla y no un enum de Prisma, así que el tipo se define
// acá a mano: es la única fuente de verdad para el resto del backend.
export const ROLES = ['ADMIN', 'OPERATOR', 'USER'] as const;

// 'ADMIN' | 'OPERATOR' | 'USER', derivado del array: si se agrega un rol
// arriba, el tipo se actualiza solo.
export type RoleName = (typeof ROLES)[number];

export interface AuthUser {
  userId: number;
  role: RoleName;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}