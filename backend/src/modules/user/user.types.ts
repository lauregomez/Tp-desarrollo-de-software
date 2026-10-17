import { RoleName } from '../../middlewares/auth.types';

export interface CreateUserDto {
  name: string;
  lastName: string;
  email: string;
  password: string;
  role: RoleName;
}

export interface UpdateUserDto {
  name?: string;
  lastName?: string;
  email?: string;
  role?: RoleName;
}

export function canDeleteUser(targetId: number, currentUserId: number): boolean {
  return targetId !== currentUserId;
}