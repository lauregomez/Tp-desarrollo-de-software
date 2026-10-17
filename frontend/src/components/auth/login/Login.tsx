import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useLocation, useNavigate, Link } from 'react-router'
import { useAuth } from '../../../context/useAuth'
import { ApiError } from '../../../lib/api'
import { initialLoginData, initialLoginErrors } from './Login.data'
import { MIN_PASSWORD_LENGTH } from '../auth.const'


export default function Login() {
  const [form, setForm] = useState(initialLoginData)

  const [errors, setErrors] = useState(initialLoginErrors)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [serverError, setServerError] = useState<string | null>(null)

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>,
    target: keyof typeof initialLoginData,
  ) {
    setForm((previous) => ({ ...previous, [target]: event.target.value }))
    setErrors((previous) => ({ ...previous, [target]: false }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setServerError(null)

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
      await login(form.email, form.password)

      navigate(from, { replace: true })
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'Ocurrió un error inesperado',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass = (hasError: boolean) =>
    `rounded-lg border px-3 py-2 ${
      hasError ? 'border-brand' : 'border-slate-300'
    }`

  return (
    <div className="w-full max-w-[420px] rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-bold">Iniciá sesión</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1">
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

        {(errors.email || errors.password) && (
          <p className="text-sm text-muted">
            {errors.email
              ? 'Ingresá tu email.'
              : `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`}
          </p>
        )}

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
        <p className="mt-4 text-center text-sm text-muted">
          ¿No tenés cuenta?{' '}
          <Link to="/registro" className="text-primary hover:underline">
           Creá una
          </Link>
        </p>
    
    </div>
  )
}
