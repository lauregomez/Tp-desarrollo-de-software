// Nombres de rol, espejo de ROLES en el backend (auth.types.ts).
// El contrato de la API habla de nombres y no de ids: el id lo asigna
// la base, el nombre es parte del dominio.
export type RoleName = 'ADMIN' | 'OPERATOR' | 'USER'

// Lo que devuelve la API. El service del backend usa un `select` con
// publicFields, así que el passwordHash nunca sale en la respuesta.
// El rol viaja anidado porque sale de la relación con la tabla roles.
export interface User {
  id: number
  name: string
  lastName: string
  email: string
  role: { name: RoleName }
  createdAt: string
  isActive: boolean
}

// Etiquetas en español, igual que CATEGORY_LABEL en match.ts.
export const ROLE_LABEL: Record<RoleName, string> = {
  ADMIN: 'Administrador',
  OPERATOR: 'Operador',
  USER: 'Usuario',
}

// Cuerpo del POST /api/users. La contraseña sólo viaja en el alta:
// el update del backend no la contempla, por decisión de seguridad
// (un admin no debería poder pisar la contraseña de otro).
export interface CreateUserDto {
  name: string
  lastName: string
  email: string
  password: string
  role: RoleName
}

// El PUT acepta los mismos campos menos la contraseña.
export type UpdateUserDto = Omit<CreateUserDto, 'password'>