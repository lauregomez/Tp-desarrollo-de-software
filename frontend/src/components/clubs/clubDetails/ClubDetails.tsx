import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'

import Button from '../../shared/button/Button'
import { getClub } from './ClubDetails.server'
import type { Club } from '../../../types/club'
import ClubLogo from '../../shared/clubLogo/ClubLogo'

export default function ClubDetails() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { state } = useLocation()
  const clubFromState = state as Club | null

  const [club, setClub] = useState<Club | null>(clubFromState ?? null)
  const [isLoading, setIsLoading] = useState(!clubFromState)

  useEffect(() => {
    if (clubFromState || !id) return

    getClub(id, {
      onSuccess: (data) => {
        setClub(data)
        setIsLoading(false)
      },
      onError: () => setIsLoading(false),
    })
  }, [id, clubFromState])

  if (isLoading) {
    return <p className="text-muted">Cargando club…</p>
  }

  if (!club) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-muted">
          No se encontró información para el club {id}.
        </p>
        <Button variant="secondary" onClick={() => navigate('/clubes')}>
          Volver al listado
        </Button>
      </div>
    )
  }

  return (
    <article className="max-w-md rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-4">
        <ClubLogo name={club.name} logoUrl={club.logoUrl} size="lg" />
        <div>
          <h2 className="text-xl font-bold text-navy">{club.name}</h2>
          {club.foundedYear !== null && (
            <p className="text-sm text-muted">
              Fundado en {club.foundedYear}
            </p>
          )}
          <p className="text-sm text-muted">ID interno: {club.id}</p>
        </div>
      </div>

      {club.description && (
        <p className="mt-6 whitespace-pre-line text-sm text-slate-700">
          {club.description}
        </p>
      )}

      <div className="mt-6 flex gap-2">
        <Button variant="secondary" onClick={() => navigate('/clubes')}>
          Volver
        </Button>
        <Button
          variant="primary"
          onClick={() =>
            navigate(`/clubes/editar/${club.id}`, { state: club })
          }
        >
          Editar
        </Button>
      </div>
    </article>
  )
}