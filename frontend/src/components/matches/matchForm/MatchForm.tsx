import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router'

import Button from '../../shared/button/Button'
import { errorToast } from '../../../shared/notifications'
import {
  getClubOptions,
  getCourtOptions,
  getMatch,
} from './MatchForm.server'
import { CATEGORY_LABEL } from '../../../types/match'
import type { Court } from '../../../types/court'
import type {
  AdminMatch,
  Category,
  ClubSummary,
  CreateMatchDto,
} from '../../../types/match'

// Output properties: el formulario no guarda nada por su cuenta,
// avisa hacia arriba y MatchAdmin decide qué hacer con el resultado.
interface MatchFormProps {
  onAdd: (match: CreateMatchDto, onFinish: () => void) => void
  onEdit: (id: number, match: CreateMatchDto, onFinish: () => void) => void
}

// El input datetime-local espera 'YYYY-MM-DDTHH:mm' en hora local,
// pero el backend manda ISO en UTC. Sin esta conversión el campo
// aparecería vacío al editar.
function toInputValue(iso: string): string {
  const date = new Date(iso)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

const EMPTY_FORM = {
  startsAt: '',
  price: '',
  category: '' as Category | '',
  homeClubId: '',
  awayClubId: '',
  courtId: '',
}

export default function MatchForm({ onAdd, onEdit }: MatchFormProps) {
  const navigate = useNavigate()

  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

  const { state } = useLocation()
  const matchFromState = state as AdminMatch | null

  // Todos los campos se guardan como string: es lo que devuelven los
  // inputs del DOM. La conversión a number ocurre recién en el submit.
  const [form, setForm] = useState(
    matchFromState
      ? {
          startsAt: toInputValue(matchFromState.startsAt),
          price: matchFromState.price,
          category: matchFromState.category,
          homeClubId: String(matchFromState.homeClubId),
          awayClubId: String(matchFromState.awayClubId),
          courtId: String(matchFromState.courtId),
        }
      : EMPTY_FORM,
  )
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Opciones de los desplegables: se piden a la API al montar.
  const [clubs, setClubs] = useState<ClubSummary[]>([])
  const [courts, setCourts] = useState<Court[]>([])

  useEffect(() => {
    getClubOptions({
      onSuccess: setClubs,
      onError: (err) => errorToast(err.message),
    })
    getCourtOptions({
      onSuccess: setCourts,
      onError: (err) => errorToast(err.message),
    })
  }, [])

  // Fallback: si estamos editando y no llegó el state (F5 o link
  // directo), pedimos el partido por su id.
  useEffect(() => {
    if (!isEditing || matchFromState || !id) return

    getMatch(Number(id), {
      onSuccess: (match) =>
        setForm({
          startsAt: toInputValue(match.startsAt),
          price: match.price,
          category: match.category,
          homeClubId: String(match.homeClubId),
          awayClubId: String(match.awayClubId),
          courtId: String(match.courtId),
        }),
      onError: (err) => {
        errorToast(err.message)
        navigate('/admin/partidos', { replace: true })
      },
    })
  }, [id, isEditing, matchFromState, navigate])

  // Handler genérico con clave computada: sirve para inputs y selects.
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

    // Validaciones de forma. Las de negocio (conflicto de cancha,
    // capacidad, entradas vendidas) las hace el backend y llegan
    // por el onError de MatchList.
    if (!form.startsAt) return setError('La fecha y hora son obligatorias')
    if (!form.category) return setError('La categoría es obligatoria')
    if (!form.homeClubId) return setError('El club local es obligatorio')
    if (!form.awayClubId) return setError('El club visitante es obligatorio')
    if (!form.courtId) return setError('La cancha es obligatoria')

    if (form.homeClubId === form.awayClubId) {
      return setError('El club local y el visitante no pueden ser el mismo')
    }

    const price = Number(form.price)
    if (!form.price || Number.isNaN(price) || price <= 0) {
      return setError('El precio debe ser un número mayor a cero')
    }

    setIsSubmitting(true)

    // datetime-local da hora local sin zona; toISOString la convierte
    // a UTC, que es lo que espera el backend.
    const payload: CreateMatchDto = {
      startsAt: new Date(form.startsAt).toISOString(),
      price,
      category: form.category as Category,
      homeClubId: Number(form.homeClubId),
      awayClubId: Number(form.awayClubId),
      courtId: Number(form.courtId),
    }

    // No reseteamos isSubmitting acá: onAdd/onEdit son asincrónicos y
    // el botón se liberaría antes de que el servidor responda. Si el
    // guardado sale bien, MatchAdmin navega y este componente se
    // desmonta; si falla, hay que volver a habilitar el botón.
    if (isEditing) {
      onEdit(Number(id), payload, () => setIsSubmitting(false))
    } else {
      onAdd(payload, () => setIsSubmitting(false))
    }
  }

  const inputClass = 'rounded-lg border border-slate-300 px-3 py-2'

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-md rounded-xl border border-slate-200 bg-white p-6"
    >
      <h2 className="text-xl font-bold text-navy">
        {isEditing ? 'Editar partido' : 'Nuevo partido'}
      </h2>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="startsAt" className="text-sm font-medium">
            Fecha y hora
          </label>
          <input
            id="startsAt"
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => handleChange(e, 'startsAt')}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="text-sm font-medium">
            Categoría
          </label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => handleChange(e, 'category')}
            className={inputClass}
          >
            <option value="">Elegí una categoría</option>
            {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="homeClubId" className="text-sm font-medium">
            Club local
          </label>
          <select
            id="homeClubId"
            value={form.homeClubId}
            onChange={(e) => handleChange(e, 'homeClubId')}
            className={inputClass}
          >
            <option value="">Elegí un club</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="awayClubId" className="text-sm font-medium">
            Club visitante
          </label>
          <select
            id="awayClubId"
            value={form.awayClubId}
            onChange={(e) => handleChange(e, 'awayClubId')}
            className={inputClass}
          >
            <option value="">Elegí un club</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="courtId" className="text-sm font-medium">
            Cancha
          </label>
          <select
            id="courtId"
            value={form.courtId}
            onChange={(e) => handleChange(e, 'courtId')}
            className={inputClass}
          >
            <option value="">Elegí una cancha</option>
            {courts.map((court) => (
              <option key={court.id} value={court.id}>
                {court.name} — {court.address}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="price" className="text-sm font-medium">
            Precio
          </label>
          <input
            id="price"
            type="number"
            min="1"
            value={form.price}
            onChange={(e) => handleChange(e, 'price')}
            placeholder="2500"
            className={inputClass}
          />
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
          onClick={() => navigate('/admin/partidos')}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isEditing ? 'Guardar cambios' : 'Crear partido'}
        </Button>
      </div>
    </form>
  )
}