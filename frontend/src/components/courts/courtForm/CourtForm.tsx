import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'

import {
  MAX_ADDRESS_LENGTH,
  MAX_CAPACITY,
  MAX_NAME_LENGTH,
  MIN_ADDRESS_LENGTH,
} from './CourtForm.const'
import Button from '../../shared/button/Button'
import { errorToast } from '../../../shared/notifications'
import { initialCourtData, initialCourtErrors } from './CourtForm.data'
import { getCourt } from './CourtForm.server'
import type { Court, CreateCourtDto } from '../../../types/court'
import type { Club } from '../../../types/club'

interface CourtFormProps {
  clubs: Club[]
  onAdd: (court: CreateCourtDto) => void
  onEdit: (id: number, court: CreateCourtDto) => void
}

const toFormData = (court: Court) => ({
  name: court.name,
  address: court.address,
  capacity: String(court.capacity),
  clubId: String(court.clubId),
})

export default function CourtForm({ clubs, onAdd, onEdit }: CourtFormProps) {
  const navigate = useNavigate()

  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

  const { state } = useLocation()
  const courtFromState = state as Court | null

  const [form, setForm] = useState(
    courtFromState ? toFormData(courtFromState) : initialCourtData,
  )
  const [errors, setErrors] = useState(initialCourtErrors)

  const nameRef = useRef<HTMLInputElement>(null)
  const addressRef = useRef<HTMLInputElement>(null)
  const capacityRef = useRef<HTMLInputElement>(null)
  const clubRef = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    if (!isEditing || courtFromState) return

    getCourt(id, {
      onSuccess: (court) => setForm(toFormData(court)),
      onError: (error) => {
        errorToast(error.message)
        navigate('/canchas', { replace: true })
      },
    })
  }, [id, isEditing, courtFromState, navigate])

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    attr: keyof typeof form,
  ) => {
    const { value } = event.target
    setForm((prevForm) => ({ ...prevForm, [attr]: value }))
    setErrors((prevErrors) => ({ ...prevErrors, [attr]: false }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const address = form.address.trim()
    const isDigitsOnly = /^\d+$/.test(form.capacity)
    const capacity = Number(form.capacity)

    const newErrors = {
      name: form.name.trim() === '',
      address:
        address.length < MIN_ADDRESS_LENGTH || address.length > MAX_ADDRESS_LENGTH,
      capacity: !isDigitsOnly || capacity <= 0 || capacity > MAX_CAPACITY,
      clubId: form.clubId === '',
    }

    if (newErrors.name || newErrors.address || newErrors.capacity || newErrors.clubId) {
      setErrors(newErrors)
      if (newErrors.name) nameRef.current?.focus()
      else if (newErrors.address) addressRef.current?.focus()
      else if (newErrors.capacity) capacityRef.current?.focus()
      else clubRef.current?.focus()
      return
    }

    const payload: CreateCourtDto = {
      name: form.name.trim(),
      address: form.address.trim(),
      capacity,
      clubId: Number(form.clubId),
    }

    if (isEditing) {
      onEdit(Number(id), payload)
    } else {
      onAdd(payload)
    }
  }

  const inputClass = (hasError: boolean) =>
    `rounded-lg border px-3 py-2 ${hasError ? 'border-brand' : 'border-slate-300'}`

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-md rounded-xl border border-slate-200 bg-white p-6"
    >
      <h2 className="text-xl font-bold text-navy">
        {isEditing ? 'Editar cancha' : 'Nueva cancha'}
      </h2>

      <div className="mt-6 flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre
        </label>
        <input
          ref={nameRef}
          id="name"
          type="text"
          value={form.name}
          onChange={(event) => handleChange(event, 'name')}
          placeholder="Cancha Principal"
          maxLength={MAX_NAME_LENGTH}
          className={inputClass(errors.name)}
        />
        {errors.name && (
          <p role="alert" className="text-sm text-brand">
            El nombre de la cancha es obligatorio.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <label htmlFor="address" className="text-sm font-medium">
          Dirección
        </label>
        <input
          ref={addressRef}
          id="address"
          type="text"
          value={form.address}
          onChange={(event) => handleChange(event, 'address')}
          placeholder="Bv. Oroño 1450, Rosario"
          maxLength={MAX_ADDRESS_LENGTH}
          className={inputClass(errors.address)}
        />
        {errors.address && (
          <p role="alert" className="text-sm text-brand">
            La dirección debe tener entre {MIN_ADDRESS_LENGTH} y{' '}
            {MAX_ADDRESS_LENGTH} caracteres.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <label htmlFor="capacity" className="text-sm font-medium">
          Capacidad
        </label>
        <input
          ref={capacityRef}
          id="capacity"
          type="text"
          inputMode="numeric"
          value={form.capacity}
          onChange={(event) => handleChange(event, 'capacity')}
          placeholder="500"
          className={inputClass(errors.capacity)}
        />
        {errors.capacity && (
          <p role="alert" className="text-sm text-brand">
            Ingresá un número entero entre 1 y {MAX_CAPACITY}.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <label htmlFor="clubId" className="text-sm font-medium">
          Club dueño
        </label>
        <select
          ref={clubRef}
          id="clubId"
          value={form.clubId}
          onChange={(event) => handleChange(event, 'clubId')}
          className={inputClass(errors.clubId)}
        >
          <option value="">Elegí un club</option>
          {clubs.map((club) => (
            <option key={club.id} value={club.id}>
              {club.name}
            </option>
          ))}
        </select>
        {errors.clubId && (
          <p role="alert" className="text-sm text-brand">
            Elegí el club dueño de la cancha.
          </p>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        <Button type="button" variant="secondary" onClick={() => navigate('/canchas')}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {isEditing ? 'Guardar cambios' : 'Crear cancha'}
        </Button>
      </div>
    </form>
  )
}