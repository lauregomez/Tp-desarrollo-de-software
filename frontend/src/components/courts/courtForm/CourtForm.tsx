import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'

import Button from '../../shared/button/Button'
import { errorToast } from '../../../shared/notifications'
import { initialCourtData, initialCourtErrors } from './CourtForm.data'
import { getCourt } from './CourtForm.server'
import type { Court, CreateCourtDto } from '../../../types/court'
import type { Club } from '../../../types/club'

// Input: los clubes para armar el desplegable llegan de CourtList, que ya los tiene.
// Output: el formulario no guarda nada por su cuenta; avisa hacia arriba
// y CourtList decide qué hacer con el resultado.
interface CourtFormProps {
  clubs: Club[]
  onAdd: (court: CreateCourtDto) => void
  onEdit: (id: number, court: CreateCourtDto) => void
}

// El estado del form guarda todo como texto (así trabajan los inputs),
// pero la cancha de la API trae números: convertimos al precargar.
const toFormData = (court: Court) => ({
  name: court.name,
  address: court.address,
  capacity: String(court.capacity),
  clubId: String(court.clubId),
})

export default function CourtForm({ clubs, onAdd, onEdit }: CourtFormProps) {
  const navigate = useNavigate()

  // useParams devuelve los segmentos dinámicos de la URL, siempre string.
  // Si hay :id estamos editando; si no, es un alta.
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

    // La cancha que CourtList mandó en navigate(..., { state: court }).
  // Puede no estar si se abre el link en otra pestaña o desde un marcador.
  const { state } = useLocation()
  const courtFromState = state as Court | null

  const [form, setForm] = useState(
    courtFromState ? toFormData(courtFromState) : initialCourtData,
  )
  const [errors, setErrors] = useState(initialCourtErrors)

  // Refs a los nodos reales: sólo para hacer focus() en el primer campo
  // con error. Hacer foco es una acción sobre el DOM que no se expresa con props.
  const nameRef = useRef<HTMLInputElement>(null)
  const addressRef = useRef<HTMLInputElement>(null)
  const capacityRef = useRef<HTMLInputElement>(null)
  const clubRef = useRef<HTMLSelectElement>(null)

    // Fallback: si estamos editando y no llegó el state (link directo),
  // pedimos la cancha por su id para precargar el formulario.
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

  // Handler genérico con clave computada: sirve para los inputs y el select.
  // Limpia el error del campo apenas el usuario empieza a corregir.
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    attr: keyof typeof form,
  ) => {
    const { value } = event.target
    setForm((prevForm) => ({ ...prevForm, [attr]: value }))
    setErrors((prevErrors) => ({ ...prevErrors, [attr]: false }))
  }

  const handleSubmit = (event: FormEvent) => {
    // Sin esto el navegador recarga la página y se pierde el estado.
    event.preventDefault()

    const capacity = Number(form.capacity)

    // Mismas reglas que valida el backend, para avisar antes de hacer la request.
    const newErrors = {
      name: form.name.trim() === '',
      address: form.address.trim() === '',
      capacity: !Number.isInteger(capacity) || capacity <= 0,
      clubId: form.clubId === '',
    }

    if (newErrors.name || newErrors.address || newErrors.capacity || newErrors.clubId) {
      setErrors(newErrors)
      // Foco en el primer campo con error, en el orden en que aparecen.
      if (newErrors.name) nameRef.current?.focus()
      else if (newErrors.address) addressRef.current?.focus()
      else if (newErrors.capacity) capacityRef.current?.focus()
      else clubRef.current?.focus()
      return
    }

    // Los inputs devuelven texto y el backend exige enteros:
    // convertimos acá, una sola vez, justo antes de enviar.
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
    // noValidate desactiva la validación nativa del navegador para que
    // corra la nuestra (con mensajes en español y foco en el campo).
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
          className={inputClass(errors.address)}
        />
        {errors.address && (
          <p role="alert" className="text-sm text-brand">
            La dirección de la cancha es obligatoria.
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
          type="number"
          min={1}
          value={form.capacity}
          onChange={(event) => handleChange(event, 'capacity')}
          placeholder="500"
          className={inputClass(errors.capacity)}
        />
        {errors.capacity && (
          <p role="alert" className="text-sm text-brand">
            Ingresá un número entero mayor a 0.
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
          {/* value="" representa "sin elegir": la validación lo detecta. */}
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