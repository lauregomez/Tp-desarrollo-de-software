import { useState } from 'react'
import type { ReactNode } from 'react'
import { apiFetch } from '../lib/api'
import { AuthContext } from './AuthContext'
import type { AuthUser, LoginResponse } from './AuthContext'

function readStoredUser(): AuthUser | null {
  const storedUser = localStorage.getItem('user')
  const storedToken = localStorage.getItem('token')

  if (!storedUser || !storedToken) return null

  try {
    return JSON.parse(storedUser) as AuthUser
  } catch {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)

  async function login(email: string, password: string) {
    const data = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}