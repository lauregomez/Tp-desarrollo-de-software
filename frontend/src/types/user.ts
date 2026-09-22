// Lo que devuelve la API. El service del backend usa un `select` con
// publicFields, así que el passwordHash nunca sale en la respuesta.
// Devuelve roleId (número), no el objeto Role: por eso el nombre del
// rol se resuelve en el front con ROLE_LABEL.
export interface User {
  id: number
  name: string
  lastName: string
  email: string
  roleId: number
  createdAt: string
}

// Ids fijos, definidos en prisma/seed.ts.
// Los roles son un catálogo cerrado: no hay pantalla para crearlos
// ni cambian en runtime, así que se resuelven acá en vez de pedirlos
// a la API en cada carga. Mismo criterio que CATEGORY_LABEL en match.ts.
export const ROLE_ADMIN = 1
export const ROLE_OPERATOR = 2
export const ROLE_USER = 3

export const ROLE_LABEL: Record<number, string> = {
  [ROLE_ADMIN]: 'Administrador',
  [ROLE_OPERATOR]: 'Operador',
  [ROLE_USER]: 'Usuario',
}

// Cuerpo del POST /api/users. La contraseña sólo viaja en el alta:
// el update del backend no la contempla, por decisión de seguridad
// (un admin no debería poder pisar la contraseña de otro).
export interface CreateUserDto {
  name: string
  lastName: string
  email: string
  password: string
  roleId: number
}

// El PUT acepta los mismos campos menos la contraseña.
export type UpdateUserDto = Omit<CreateUserDto, 'password'>