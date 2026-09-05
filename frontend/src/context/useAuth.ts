import { useContext } from 'react'
import { AuthContext } from './AuthContext'
import type { AuthContextValue } from './AuthContext'

// Hook propio para consumir el contexto.
// Evita que cada componente importe AuthContext y chequee el null.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }

  return context
}