export interface CreateUserDto {
  name: string;
  lastName: string;
  email: string;
  password: string;
  roleId: number;
}

export interface UpdateUserDto {
  name?: string;
  lastName?: string;
  email?: string;
  roleId?: number;
}

/**
 * Reglas de negocio centralizadas, como en match.types.ts.
 * Un admin no puede eliminar su propio usuario: quedaría sin sesión y,
 * si fuera el último, el sistema sin nadie que administre.
 *
 * Vive acá y no en el controller para poder probarla sin levantar Express:
 * la regla es una decisión del dominio, no del transporte HTTP.
 */
export function canDeleteUser(targetId: number, currentUserId: number): boolean {
  return targetId !== currentUserId;
}