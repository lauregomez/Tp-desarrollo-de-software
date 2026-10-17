import { Request } from 'express';

export const ROLES = ['ADMIN', 'OPERATOR', 'USER'] as const;

export type RoleName = (typeof ROLES)[number];

export interface AuthUser {
  userId: number;
  role: RoleName;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}