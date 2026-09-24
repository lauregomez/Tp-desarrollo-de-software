import { apiFetch } from '../../../lib/api'
import type { User } from '../../../types/user'

// POST /api/auth/register es público: no lleva token.
// El backend ignora cualquier roleId que venga en el body y fuerza el
// rol USER, así que nadie puede autoasignarse permisos de admin.
export interface RegisterDto {
  name: string
  lastName: string
  email: string
  password: string
}

// Devuelve el usuario creado, sin token: registrarse no inicia sesión.
// Son dos acciones distintas y el usuario pasa por el login después.
export async function register(dto: RegisterDto): Promise<User> {
  return apiFetch<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}