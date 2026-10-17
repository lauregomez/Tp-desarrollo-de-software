import { Link, Navigate, Outlet } from 'react-router'
import arfLogo from '../../../assets/arf-logo.png'
import { useAuth } from '../../../context/useAuth'

export default function AuthLayout() {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="bg-navy py-4">
        <Link to="/" className="flex items-center justify-center gap-2">
          <img src={arfLogo} alt="" className="h-8 w-8 object-contain" />
          <span className="text-lg font-bold text-white">Rosarina Futsal</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <Outlet />
      </main>

      <footer className="py-4 text-center text-sm text-muted">
        © {new Date().getFullYear()} Rosarina Futsal
      </footer>
    </div>
  )
}