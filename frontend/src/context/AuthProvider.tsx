import { useState } from 'react'
import type { ReactNode } from 'react'
import { apiFetch } from '../lib/api'
import { AuthContext } from './AuthContext'
import type { AuthUser, LoginResponse } from './AuthContext'

// Lee la sesión persistida. Se ejecuta una sola vez, antes del primer
// render, porque localStorage es síncrono. Así evitamos el useEffect
// (que provocaría un render en cascada) y el estado isLoading.
function readStoredUser(): AuthUser | null {
  const storedUser = localStorage.getItem('user')
  const storedToken = localStorage.getItem('token')

  if (!storedUser || !storedToken) return null

  try {
    return JSON.parse(storedUser) as AuthUser
  } catch {
    // Si el JSON está corrupto, limpiamos en vez de romper la app.
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Inicializador lazy: la función corre una única vez, en el montaje.
  // Sin los paréntesis de flecha se ejecutaría en cada render.
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)

  async function login(email: string, password: string) {
    // apiFetch lanza ApiError si el backend responde 401.
    // No lo capturamos acá: Login lo maneja para mostrar el mensaje.
    const data = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    // Primero persistimos, después actualizamos el estado:
    // así el token ya está disponible si algo dispara una request.
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