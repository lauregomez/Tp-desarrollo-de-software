import { Link, Outlet } from 'react-router'
import arfLogo from '../../../assets/arf-logo.png'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="bg-navy py-4">
        {/* Permite volver al home sin iniciar sesión, igual que en el Header. */}
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