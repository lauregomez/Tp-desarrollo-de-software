import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'

import Button from '../../shared/button/Button'
import { getCourt } from './CourtDetails.server'
import type { Court } from '../../../types/court'
import type { Club } from '../../../types/club'

// Los clubes llegan desde CourtList, que ya los tiene cargados:
// así no hacemos otra request sólo para resolver el nombre del dueño.
interface CourtDetailsProps {
  clubs: Club[]
}

export default function CourtDetails({ clubs }: CourtDetailsProps) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { state } = useLocation()
  const courtFromState = state as Court | null

  // Si venimos con la cancha en el state, arrancamos con el dato puesto
  // y sin loading: no hay request ni parpadeo de carga.
  const [court, setCourt] = useState<Court | null>(courtFromState ?? null)
  const [isLoading, setIsLoading] = useState(!courtFromState)

  useEffect(() => {
    // Ya tenemos la cancha (o no hay id que pedir): no hace falta la request.
    if (courtFromState || !id) return

    getCourt(id, {
      onSuccess: (data) => {
        setCourt(data)
        setIsLoading(false)
      },
      // Sin toast: el bloque de "no encontrada" de abajo ya explica qué pasó.
      onError: () => setIsLoading(false),
    })
  }, [id, courtFromState])

  if (isLoading) {
    return <p className="text-muted">Cargando cancha…</p>
  }

  // El id no existe o falló la conexión. Sin este bloque,
  // el JSX de abajo rompería al leer court.name de null.
  if (!court) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-muted">No se encontró la cancha {id}.</p>
        <Button variant="secondary" onClick={() => navigate('/canchas')}>
          Volver al listado
        </Button>
      </div>
    )
  }

  const club = clubs.find((c) => c.id === court.clubId)

  return (
    <article className="max-w-md rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-bold text-navy">{court.name}</h2>
      <p className="mt-2 text-sm text-muted">
        Club dueño: {club?.name ?? 'Club desconocido'}
      </p>
      <p className="text-sm text-muted">Capacidad: {court.capacity}</p>

      <div className="mt-6 flex gap-2">
        <Button variant="secondary" onClick={() => navigate('/canchas')}>
          Volver
        </Button>
      </div>
    </article>
  )
}