import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router'

import Button from '../../shared/button/Button'
import { errorToast } from '../../../shared/notifications'
import { initialClubData, initialClubErrors } from './ClubForm.data'
import { getClub } from './ClubForm.server'
import type { Club, CreateClubDto } from '../../../types/club'

const clubToForm = (club: Club) => ({
  name: club.name,
  logoUrl: club.logoUrl ?? '',
  description: club.description ?? '',
  foundedYear: club.foundedYear?.toString() ?? '',
})

interface ClubFormProps {
  onAdd: (club: CreateClubDto) => void
  onEdit: (id: number, club: CreateClubDto) => void
}

export default function ClubForm({ onAdd, onEdit }: ClubFormProps) {
  const navigate = useNavigate()

  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

  const { state } = useLocation()
  const clubFromState = state as Club | null

  const [form, setForm] = useState(
    clubFromState ? clubToForm(clubFromState) : initialClubData,
  )
  const [errors, setErrors] = useState(initialClubErrors)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)
  const yearRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isEditing || clubFromState) return

    getClub(id, {
      onSuccess: (club) => setForm(clubToForm(club)),
      onError: (error) => {
        errorToast(error.message)
        navigate('/clubes', { replace: true })
      },
    })
  }, [id, isEditing, clubFromState, navigate])

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    attr: keyof typeof form,
  ) => {
    const { value } = event.target

    setForm((prevForm) => ({ ...prevForm, [attr]: value }))
    setErrors((prevErrors) => ({ ...prevErrors, [attr]: false }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (!nameRef.current?.value.trim().length) {
      setErrors((prevErrors) => ({ ...prevErrors, name: true }))
      nameRef.current?.focus()
      return
    }

    const typedYear = form.foundedYear.trim()
    const foundedYear = typedYear === '' ? null : Number(typedYear)

    if (foundedYear !== null && !Number.isInteger(foundedYear)) {
      setErrors((prevErrors) => ({ ...prevErrors, foundedYear: true }))
      yearRef.current?.focus()
      return
    }

    setIsSubmitting(true)

    const payload: CreateClubDto = {
      name: form.name.trim(),
      logoUrl: form.logoUrl.trim(),
      description: form.description.trim(),
      foundedYear,
    }

    if (isEditing) {
      onEdit(Number(id), payload)
    } else {
      onAdd(payload)
    }

    setIsSubmitting(false)
  }

  const handleCancel = () => navigate('/clubes')

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-md rounded-xl border border-slate-200 bg-white p-6"
    >
      <h2 className="text-xl font-bold text-navy">
        {isEditing ? 'Editar club' : 'Nuevo club'}
      </h2>

      <div className="mt-6 flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre
        </label>
        <input
          ref={nameRef}
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={(event) => handleInputChange(event, 'name')}
          placeholder="Club Atlético Rosario"
          className={`rounded-lg border px-3 py-2 ${
            errors.name ? 'border-brand' : 'border-slate-300'
          }`}
        />
      </div>

      {errors.name && (
        <p role="alert" className="mt-2 text-sm text-brand">
          El nombre del club es obligatorio.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-1">
        <label htmlFor="logoUrl" className="text-sm font-medium">
          URL del logo <span className="text-muted">(opcional)</span>
        </label>
        <input
          id="logoUrl"
          name="logoUrl"
          type="url"
          value={form.logoUrl}
          onChange={(event) => handleInputChange(event, 'logoUrl')}
          placeholder="https://ejemplo.com/logo.png"
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium">
          Descripción <span className="text-muted">(opcional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={1000}
          value={form.description}
          onChange={(event) => handleInputChange(event, 'description')}
          placeholder="Breve reseña del club"
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <label htmlFor="foundedYear" className="text-sm font-medium">
          Año de fundación <span className="text-muted">(opcional)</span>
        </label>
        <input
          ref={yearRef}
          id="foundedYear"
          name="foundedYear"
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={form.foundedYear}
          onChange={(event) => handleInputChange(event, 'foundedYear')}
          placeholder="1930"
          className={`rounded-lg border px-3 py-2 ${
            errors.foundedYear ? 'border-brand' : 'border-slate-300'
          }`}
        />
      </div>

      {errors.foundedYear && (
        <p role="alert" className="mt-2 text-sm text-brand">
          El año de fundación tiene que ser un número entero.
        </p>
      )}

      <div className="mt-6 flex gap-2">
        <Button type="button" variant="secondary" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isEditing ? 'Guardar cambios' : 'Crear club'}
        </Button>
      </div>
    </form>
  )
}
