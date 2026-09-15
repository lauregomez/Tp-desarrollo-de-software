import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../../context/useAuth'
import { ApiError } from '../../../lib/api'
import { initialLoginData, initialLoginErrors } from './Login.data'
import { MIN_PASSWORD_LENGTH } from './Login.const'

export default function Login() {
  // Un solo objeto para todo el formulario en vez de un useState por campo:
  // así agregar un input no obliga a agregar otro estado.
  const [form, setForm] = useState(initialLoginData)

  // Un booleano por campo. Sólo marca qué input quedó inválido;
  // el texto de ayuda se arma en el render a partir de estos flags.
  const [errors, setErrors] = useState(initialLoginErrors)

  // Estado de la petición: bloquea el botón mientras viaja el request.
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Error que devuelve el backend (401, servidor caído, etc.).
  // Va separado de `errors` porque no pertenece a ningún campo puntual.
  const [serverError, setServerError] = useState<string | null>(null)

  // useRef nos da acceso directo al nodo del DOM para poder llamar a
  // .focus(). El foco es imperativo: no se puede expresar como estado,
  // porque no describe "qué se ve" sino una acción sobre el navegador.
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Si Protected mandó al usuario acá, guardó en state.from la ruta que
  // quería visitar. Si no, después del login va al home.
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  // Handler genérico: la clave computada [target] permite que un mismo
  // handler sirva para todos los inputs. Al escribir también se limpia
  // el error de ese campo, para que el aviso desaparezca al corregirlo.
  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>,
    target: keyof typeof initialLoginData,
  ) {
    setForm((previous) => ({ ...previous, [target]: event.target.value }))
    setErrors((previous) => ({ ...previous, [target]: false }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Sin esto el navegador recarga la página al enviar el form
    // y se pierde todo el estado de React.
    event.preventDefault()

    setServerError(null)

    // Validación de a un campo por vez: se marca el error, se enfoca el
    // input con la ref y se corta con return, así el usuario ve el cursor
    // parado justo en el campo que tiene que corregir.
    if (form.email.trim() === '') {
      setErrors({ ...initialLoginErrors, email: true })
      emailRef.current?.focus()
      return
    }

    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setErrors({ ...initialLoginErrors, password: true })
      passwordRef.current?.focus()
      return
    }

    setErrors(initialLoginErrors)
    setIsSubmitting(true)

    try {
      // login() viene del AuthContext: pega a la API, guarda el token
      // en localStorage y actualiza el usuario del contexto.
      await login(form.email, form.password)

      // replace: true evita que el botón "atrás" vuelva al login
      // cuando el usuario ya inició sesión.
      navigate(from, { replace: true })
    } catch (error) {
      // apiFetch lanza ApiError con el message que mandó el backend
      // (por ej. "Email o contraseña incorrectos" en un 401).
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'Ocurrió un error inesperado',
      )
    } finally {
      // finally corre tanto si salió bien como si falló: sin él, un error
      // dejaría el botón deshabilitado para siempre.
      setIsSubmitting(false)
    }
  }

  // El borde del input se arma condicionalmente a partir de errors.
  const inputClass = (hasError: boolean) =>
    `rounded-lg border px-3 py-2 ${
      hasError ? 'border-brand' : 'border-slate-300'
    }`

  return (
    <div className="w-full max-w-[420px] rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-bold">Iniciá sesión</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1">
          {/* htmlFor + id conectan el label con el input:
              al hacer click en el texto se enfoca el campo. */}
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            ref={emailRef}
            value={form.email}
            onChange={(event) => handleInputChange(event, 'email')}
            autoComplete="email"
            aria-invalid={errors.email}
            className={inputClass(errors.email)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            ref={passwordRef}
            value={form.password}
            onChange={(event) => handleInputChange(event, 'password')}
            autoComplete="current-password"
            aria-invalid={errors.password}
            className={inputClass(errors.password)}
          />
        </div>

        {/* Renderizado condicional: el hint sólo existe si algún campo
            quedó marcado como inválido. */}
        {(errors.email || errors.password) && (
          <p className="text-sm text-muted">
            {errors.email
              ? 'Ingresá tu email.'
              : `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`}
          </p>
        )}

        {/* role="alert" hace que los lectores de pantalla anuncien
            el mensaje apenas aparece. */}
        {serverError && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-brand"
          >
            {serverError}
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
