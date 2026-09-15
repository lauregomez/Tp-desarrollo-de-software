import { Navigate, Outlet, useLocation } from 'react-router'

// Recibe la sesión por props en vez de leer el contexto por dentro:
// así el componente es fácil de testear y no depende del AuthProvider.
interface ProtectedProps {
  isSignedIn: boolean
  isLoading?: boolean
  roles?: string[]
  userRole?: string
}

export default function Protected({
  isSignedIn,
  isLoading = false,
  roles,
  userRole,
}: ProtectedProps) {
  const location = useLocation()

  // isLoading es imprescindible: en el primer render el AuthProvider
  // todavía no leyó localStorage, así que isSignedIn es false aunque
  // haya sesión válida. Sin este chequeo, un F5 expulsaría al login
  // a un usuario que sí está logueado.
  if (isLoading) {
    return <p className="p-4 text-muted">Cargando...</p>
  }

  // Guardamos la ruta que quería visitar en state.from para que Login
  // pueda devolverlo ahí después de autenticarse.
  if (!isSignedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Autenticado pero sin el rol necesario: no tiene sentido mandarlo al
  // login (ya inició sesión), así que vuelve al home.
  if (roles && !roles.includes(userRole ?? '')) {
    return <Navigate to="/" replace />
  }

  // Outlet renderiza la ruta hija que matcheó.
  return <Outlet />
}
