import { apiFetch } from '../../../lib/api'
import type { User } from '../../../types/user'

export interface RegisterDto {
  name: string
  lastName: string
  email: string
  password: string
}

export async function register(dto: RegisterDto): Promise<User> {
  return apiFetch<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}