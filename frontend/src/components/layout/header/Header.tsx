import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../../context/useAuth";
import arfLogo from "../../../assets/arf-logo.png";

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
  signedIn?: boolean;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Partidos", end: true },
  { to: "/mis-entradas", label: "Mis entradas", signedIn: true },
  { to: "/validar-entradas", label: "Validar entradas", roles: ["OPERATOR", "ADMIN"] },
  { to: "/clubes", label: "Clubes", roles: ["ADMIN"] },
  { to: "/canchas", label: "Canchas", roles: ["ADMIN"] },
  { to: "/admin/usuarios", label: "Usuarios", roles: ["ADMIN"] },
  { to: "/admin/partidos", label: "Gestión", roles: ["ADMIN"] },
  { to: "/admin/historial", label: "Historial", roles: ["ADMIN"] },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "border-b-2 border-white pb-1 text-white"
    : "pb-1 text-white/70 hover:text-white";

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "block py-2 font-semibold text-white"
    : "block py-2 text-white/70 hover:text-white";

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpenAt, setMenuOpenAt] = useState<string | null>(null);
  const isMenuOpen = menuOpenAt === location.pathname;

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.roles) return user !== null && item.roles.includes(user.role);
    if (item.signedIn) return user !== null;
    return true;
  });

  const closeMenu = () => setMenuOpenAt(null);

  const toggleMenu = () =>
    setMenuOpenAt(isMenuOpen ? null : location.pathname);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="bg-navy">
      <div className="mx-auto flex max-w-app items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <NavLink to="/" onClick={closeMenu} className="flex items-center gap-2">
          <img src={arfLogo} alt="" className="h-8 w-8 object-contain" />
          <span className="text-lg font-bold text-white">Rosarina Futsal</span>
        </NavLink>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {visibleItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {user ? (
          <>
            <div className="hidden items-center gap-3 md:flex">
              <span className="text-sm text-white">
                {user.name} {user.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-white/70 hover:text-white"
              >
                Salir
              </button>
            </div>

            <button
              type="button"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              className="text-white md:hidden"
            >
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </>
        ) : (
          <NavLink
            to="/login"
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:brightness-110"
          >
            Ingresar
          </NavLink>
        )}
      </div>

      {user && isMenuOpen && (
        <nav
          id="mobile-menu"
          className="border-t border-white/10 px-4 pb-4 md:hidden"
        >
          <ul className="flex flex-col">
            {visibleItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={closeMenu}
                  className={mobileLinkClass}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-3">
            <span className="text-sm text-white">
              {user.name} {user.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-white/70 hover:text-white"
            >
              Salir
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}