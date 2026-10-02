import { RoleName } from '../../middlewares/auth.types';

// El contrato habla de nombres de rol y no de ids: el id lo asigna la
// base y depende de cómo se cargó el seed, mientras que el nombre es
// parte del dominio. RoleName sale de auth.types.ts, que es la única
// fuente de verdad de los roles en el backend.
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