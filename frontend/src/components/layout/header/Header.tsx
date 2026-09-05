import { NavLink } from 'react-router'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'border-b-2 border-white pb-1 text-white'
    : 'pb-1 text-white/70 hover:text-white'

export default function Header() {
  return (
    <header className="bg-navy">
      <div className="mx-auto flex max-w-app items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-brand" />
          <span className="text-lg font-bold text-white">Rosarina Futsal</span>
        </NavLink>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <NavLink to="/" className={linkClass} end>
            Partidos
          </NavLink>
          <NavLink to="/mis-entradas" className={linkClass}>
            Mis entradas
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white/20" />
          <span className="hidden text-sm text-white md:inline">
            Laureano Gómez
          </span>
        </div>
      </div>
    </header>
  )
}