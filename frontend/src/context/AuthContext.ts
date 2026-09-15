import { createContext } from 'react'

// Forma del usuario que devuelve el backend en POST /api/auth/login.
// El rol viene como string plano ('ADMIN' | 'OPERATOR' | 'USER'),
// así que no hace falta decodificar el JWT en el front.
export interface AuthUser {
  id: number
  name: string
  lastName: string
  email: string
  role: string
}

// Respuesta completa del login: token + datos del usuario.
export interface LoginResponse {
  token: string
  user: AuthUser
}

// Lo que el contexto expone a toda la app.
export interface AuthContextValue {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

// El valor inicial es null: si un componente lo lee sin estar dentro
// del Provider, el hook useAuth lo detecta y avisa con un error claro.
export const AuthContext = createContext<AuthContextValue | null>(null)