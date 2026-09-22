import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../../../context/useAuth";
import arfLogo from "../../../assets/arf-logo.png";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "border-b-2 border-white pb-1 text-white"
    : "pb-1 text-white/70 hover:text-white";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // replace evita que el botón "atrás" vuelva a una pantalla
    // que ya no tiene sesión detrás.
    navigate("/", { replace: true });
  };

  return (
    <header className="bg-navy">
      <div className="mx-auto flex max-w-app items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <NavLink to="/" className="flex items-center gap-2">
          <img src={arfLogo} alt="" className="h-8 w-8 object-contain" />
          <span className="text-lg font-bold text-white">Rosarina Futsal</span>
        </NavLink>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <NavLink to="/" className={linkClass} end>
            Partidos
          </NavLink>

          {/* Sólo tiene sentido para alguien logueado. */}
          {user && (
            <NavLink to="/mis-entradas" className={linkClass}>
              Mis entradas
            </NavLink>
          )}

          {/* Esconder el link es UX, no seguridad: el backend rechaza
              igual a quien no sea ADMIN. Evita mostrar una opción
              que terminaría en un error. */}
          {user?.role === "ADMIN" && (
            <>
              <NavLink to="/clubes" className={linkClass}>
                Clubes
              </NavLink>
              <NavLink to="/canchas" className={linkClass}>
                Canchas
              </NavLink>
              <NavLink to="/admin/usuarios" className={linkClass}>
                Usuarios
              </NavLink>
              <NavLink to="/admin/partidos" className={linkClass}>
                Gestión
              </NavLink>
            </>
          )}
        </nav>

        {/* El header muestra la sesión real: nombre y logout si hay
            usuario, botón de ingresar si no. */}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-white md:inline">
              {user.name} {user.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-white/70 hover:text-white"
            >
              Salir
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:brightness-110"
          >
            Ingresar
          </NavLink>
        )}
      </div>
    </header>
  );
}
