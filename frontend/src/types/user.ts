export type RoleName = 'ADMIN' | 'OPERATOR' | 'USER'

export interface User {
  id: number
  name: string
  lastName: string
  email: string
  role: { name: RoleName }
  createdAt: string
  isActive: boolean
}

export const ROLE_LABEL: Record<RoleName, string> = {
  ADMIN: 'Administrador',
  OPERATOR: 'Operador',
  USER: 'Usuario',
}

export interface CreateUserDto {
  name: string
  lastName: string
  email: string
  password: string
  role: RoleName
}

export type UpdateUserDto = Omit<CreateUserDto, 'password'>