import { Navigate, Outlet, useLocation } from 'react-router'

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

  if (isLoading) {
    return <p className="p-4 text-muted">Cargando...</p>
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && !roles.includes(userRole ?? '')) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
