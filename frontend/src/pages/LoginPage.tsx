import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'

export default function LoginPage() {
  // Estado del formulario: cada input es un componente controlado,
  // su valor vive acá y no en el DOM.
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Estado de la petición: mensaje de error y bloqueo del botón.
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Si ProtectedRoute mandó al usuario acá, guardó en state.from
  // la ruta que quería visitar. Si no, después del login va al home.
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  async function handleSubmit(e: FormEvent) {
    // Sin esto el navegador recarga la página y se pierde todo el estado.
    e.preventDefault()

    setError(null)
    setIsSubmitting(true)

    try {
      // login() viene del AuthContext: pega a la API, guarda el token
      // en localStorage y actualiza el usuario del contexto.
      await login(email, password)

      // replace: true evita que el botón "atrás" vuelva al login
      // cuando el usuario ya inició sesión.
      navigate(from, { replace: true })
    } catch (err) {
      // apiFetch lanza ApiError con el message que mandó el backend
      // (por ej. "Email o contraseña incorrectos" en un 401).
      setError(
        err instanceof ApiError ? err.message : 'Ocurrió un error inesperado',
      )
    } finally {
      // finally corre tanto si salió bien como si falló:
      // así el botón nunca queda bloqueado para siempre.
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-[420px] rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-bold">Iniciá sesión</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          {/* htmlFor + id conectan el label con el input:
              al hacer click en el texto se enfoca el campo. */}
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        {/* Renderizado condicional: el bloque sólo existe si hay error.
            role="alert" hace que los lectores de pantalla lo anuncien. */}
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-brand"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:brightness-110 disabled:opacity-50"
        >
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}