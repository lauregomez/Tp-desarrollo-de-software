import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ApiError } from '../../../lib/api'
import { successToast } from '../../../shared/notifications'
import { register } from './Register.server'
import { initialRegisterData, initialRegisterErrors } from './Register.data'
import { MIN_PASSWORD_LENGTH } from './Register.const'

export default function Register() {
  const [form, setForm] = useState(initialRegisterData)
  const [errors, setErrors] = useState(initialRegisterErrors)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Error que devuelve el backend (409 por email repetido, servidor
  // caído). Va separado de `errors` porque no pertenece a un campo.
  const [serverError, setServerError] = useState<string | null>(null)

  const nameRef = useRef<HTMLInputElement>(null)
  const lastNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const navigate = useNavigate()

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>,
    target: keyof typeof initialRegisterData,
  ) {
    setForm((previous) => ({ ...previous, [target]: event.target.value }))
    setErrors((previous) => ({ ...previous, [target]: false }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setServerError(null)

    // Validación de a un campo por vez: se marca el error, se enfoca el
    // input con la ref y se corta con return, así el cursor queda parado
    // justo en el campo que hay que corregir.
    if (form.name.trim() === '') {
      setErrors({ ...initialRegisterErrors, name: true })
      nameRef.current?.focus()
      return
    }

    if (form.lastName.trim() === '') {
      setErrors({ ...initialRegisterErrors, lastName: true })
      lastNameRef.current?.focus()
      return
    }

    if (!form.email.includes('@')) {
      setErrors({ ...initialRegisterErrors, email: true })
      emailRef.current?.focus()
      return
    }

    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setErrors({ ...initialRegisterErrors, password: true })
      passwordRef.current?.focus()
      return
    }

    setErrors(initialRegisterErrors)
    setIsSubmitting(true)

    try {
      await register({
        name: form.name.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })

      // El registro no devuelve token: mandamos al login para que
      // inicie sesión con los datos que acaba de crear.
      successToast('¡Cuenta creada! Ya podés iniciar sesión.')
      navigate('/login', { replace: true })
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

  // El hint se arma a partir de los flags, mostrando el del primer
  // campo inválido.
  const hint = errors.name
    ? 'Ingresá tu nombre.'
    : errors.lastName
      ? 'Ingresá tu apellido.'
      : errors.email
        ? 'Ingresá un email válido.'
        : errors.password
          ? `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
          : null

  return (
    <div className="w-full max-w-[420px] rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-bold">Creá tu cuenta</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium">
            Nombre
          </label>
          <input
            id="name"
            type="text"
            ref={nameRef}
            value={form.name}
            onChange={(event) => handleInputChange(event, 'name')}
            autoComplete="given-name"
            aria-invalid={errors.name}
            className={inputClass(errors.name)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="lastName" className="text-sm font-medium">
            Apellido
          </label>
          <input
            id="lastName"
            type="text"
            ref={lastNameRef}
            value={form.lastName}
            onChange={(event) => handleInputChange(event, 'lastName')}
            autoComplete="family-name"
            aria-invalid={errors.lastName}
            className={inputClass(errors.lastName)}
          />
        </div>

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
            // new-password: le avisa al navegador que sugiera una clave
            // nueva en vez de autocompletar una guardada.
            autoComplete="new-password"
            aria-invalid={errors.password}
            className={inputClass(errors.password)}
          />
        </div>

        {hint && <p className="text-sm text-brand">{hint}</p>}

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
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="text-primary hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </div>
  )
}