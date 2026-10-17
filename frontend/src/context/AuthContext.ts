import { createContext } from 'react'

export interface AuthUser {
  id: number
  name: string
  lastName: string
  email: string
  role: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

export interface AuthContextValue {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)