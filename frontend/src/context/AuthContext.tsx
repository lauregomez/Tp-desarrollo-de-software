import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { apiFetch } from '../lib/api'

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
interface LoginResponse {
  token: string
  user: AuthUser
}

// Lo que el contexto expone a toda la app.
interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

// El valor inicial es null: si un componente lo lee sin estar dentro
// del Provider, el hook useAuth lo detecta y avisa con un error claro.
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  // Arranca en true: al montar todavía no sabemos si hay sesión guardada.
  // Sin este estado, ProtectedRoute redirigiría al login en el primer
  // render aunque el usuario tenga sesión válida en localStorage.
  const [isLoading, setIsLoading] = useState(true)

  // Se ejecuta una sola vez al montar la app (array de dependencias vacío).
  // Recupera la sesión persistida para que un F5 no cierre sesión.
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        // Si el JSON está corrupto, limpiamos en vez de romper la app.
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }

    setIsLoading(false)
  }, [])

  async function login(email: string, password: string) {
    // apiFetch lanza ApiError si el backend responde 401.
    // No lo capturamos acá: LoginPage lo maneja para mostrar el mensaje.
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
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook propio para consumir el contexto.
// Evita que cada componente importe AuthContext y chequee el null.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }

  return context
}