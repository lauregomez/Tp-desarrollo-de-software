import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router'

import Button from '../../shared/button/Button'
import { errorToast } from '../../../shared/notifications'
import { getUser } from './UserForm.server'
import { ROLE_LABEL } from '../../../types/user'
import type { User, CreateUserDto } from '../../../types/user'

// Output properties: el formulario no guarda nada por su cuenta,
// avisa hacia arriba y UserList decide qué hacer con el resultado.
// onFinish libera el botón si el guardado falla.
interface UserFormProps {
  onAdd: (user: CreateUserDto, onFinish: () => void) => void
  onEdit: (id: number, user: CreateUserDto, onFinish: () => void) => void
}

const EMPTY_FORM = {
  name: '',
  lastName: '',
  email: '',
  password: '',
  roleId: '',
}

export default function UserForm({ onAdd, onEdit }: UserFormProps) {
  const navigate = useNavigate()

  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

  const { state } = useLocation()
  const userFromState = state as User | null

  // Todos los campos como string: es lo que devuelven los inputs.
  // La conversión de roleId a number ocurre recién en el submit.
  const [form, setForm] = useState(
    userFromState
      ? {
          name: userFromState.name,
          lastName: userFromState.lastName,
          email: userFromState.email,
          password: '',
          roleId: String(userFromState.roleId),
        }
      : EMPTY_FORM,
  )
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fallback: si estamos editando y no llegó el state (F5 o link
  // directo), pedimos el usuario por su id.
  useEffect(() => {
    if (!isEditing || userFromState || !id) return

    getUser(Number(id), {
      onSuccess: (user) =>
        setForm({
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          password: '',
          roleId: String(user.roleId),
        }),
      onError: (err) => {
        errorToast(err.message)
        navigate('/admin/usuarios', { replace: true })
      },
    })
  }, [id, isEditing, userFromState, navigate])

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    attr: keyof typeof form,
  ) => {
    const { value } = event.target
    setForm((prev) => ({ ...prev, [attr]: value }))
    setError('')
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    // Validaciones de forma. El email duplicado (409) lo detecta
    // el backend y llega por el onError de UserList.
    if (!form.name.trim()) return setError('El nombre es obligatorio')
    if (!form.lastName.trim()) return setError('El apellido es obligatorio')
    if (!form.email.includes('@')) return setError('El email no es válido')
    if (!form.roleId) return setError('El rol es obligatorio')

    // La contraseña sólo se valida en el alta: el update del backend
    // no la contempla, así que al editar el campo ni se muestra.
    if (!isEditing && form.password.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres')
    }

    setIsSubmitting(true)

    const payload: CreateUserDto = {
      name: form.name.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      roleId: Number(form.roleId),
    }

    // No reseteamos isSubmitting acá: onAdd/onEdit son asincrónicos.
    if (isEditing) {
      onEdit(Number(id), payload, () => setIsSubmitting(false))
    } else {
      onAdd(payload, () => setIsSubmitting(false))
    }
  }

  const inputClass = 'rounded-lg border border-slate-300 px-3 py-2'

  return (
    // noValidate desactiva la validación nativa del navegador, para que
    // los mensajes de error sean los nuestros y no los del browser.
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-md rounded-xl border border-slate-200 bg-white p-6"
    >
      <h2 className="text-xl font-bold text-navy">
        {isEditing ? 'Editar usuario' : 'Nuevo usuario'}
      </h2>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium">
            Nombre
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => handleChange(e, 'name')}
            placeholder="Juan"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="lastName" className="text-sm font-medium">
            Apellido
          </label>
          <input
            id="lastName"
            type="text"
            value={form.lastName}
            onChange={(e) => handleChange(e, 'lastName')}
            placeholder="Pérez"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange(e, 'email')}
            placeholder="juan@arf.com"
            className={inputClass}
          />
        </div>

        {/* El campo sólo existe en el alta. Al editar no se muestra
            porque el backend no acepta cambios de contraseña: cada
            usuario cambia la suya, un admin no pisa la de otro. */}
        {!isEditing && (
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => handleChange(e, 'password')}
              placeholder="Mínimo 8 caracteres"
              className={inputClass}
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="roleId" className="text-sm font-medium">
            Rol
          </label>
          <select
            id="roleId"
            value={form.roleId}
            onChange={(e) => handleChange(e, 'roleId')}
            className={inputClass}
          >
            <option value="">Elegí un rol</option>
            {Object.entries(ROLE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-brand">
          {error}
        </p>
      )}

      <div className="mt-6 flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/admin/usuarios')}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isEditing ? 'Guardar cambios' : 'Crear usuario'}
        </Button>
      </div>
    </form>
  )
}