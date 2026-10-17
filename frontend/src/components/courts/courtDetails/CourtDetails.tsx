import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'

import Button from '../../shared/button/Button'
import { getCourt } from './CourtDetails.server'
import type { Court } from '../../../types/court'
import type { Club } from '../../../types/club'

interface CourtDetailsProps {
  clubs: Club[]
}

export default function CourtDetails({ clubs }: CourtDetailsProps) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { state } = useLocation()
  const courtFromState = state as Court | null

  const [court, setCourt] = useState<Court | null>(courtFromState ?? null)
  const [isLoading, setIsLoading] = useState(!courtFromState)

  useEffect(() => {
    if (courtFromState || !id) return

    getCourt(id, {
      onSuccess: (data) => {
        setCourt(data)
        setIsLoading(false)
      },
      onError: () => setIsLoading(false),
    })
  }, [id, courtFromState])

  if (isLoading) {
    return <p className="text-muted">Cargando cancha…</p>
  }

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
      <p className="text-sm text-muted">Dirección: {court.address}</p>
      <p className="text-sm text-muted">Capacidad: {court.capacity}</p>

      <div className="mt-6 flex gap-2">
        <Button variant="secondary" onClick={() => navigate('/canchas')}>
          Volver
        </Button>
       <Button
         variant="primary"
         onClick={() => navigate(`/canchas/editar/${court.id}`, { state: court })}
       >
         Editar
       </Button>
      </div>
    </article>
  )
}