import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import Button from '../../shared/button/Button'
import { getMatchById } from './MatchDetails.server'
import ClubLogo from '../../shared/clubLogo/ClubLogo'
import { CATEGORY_LABEL } from '../../../types/match'
import type { PublicMatch } from '../../../types/match'
import { formatPrice, formatShortDate, formatTime } from '../../../lib/format'

export default function MatchDetails() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [match, setMatch] = useState<PublicMatch | null>(null)
   // Si no hay id en la URL no hay nada que pedir, así que arrancamos
   // sin loading. Inicializar el estado con el valor correcto evita el
   // setState sincrónico dentro del efecto, que dispara un render de más.
  const [isLoading, setIsLoading] = useState(Boolean(id))

  useEffect(() => {
    if (!id) return

    // useParams siempre devuelve string: el servicio espera number,
    // así que convertimos acá. Un id no numérico (/partidos/abc) da NaN
    // y el backend responde 400, que cae en el onError.
    getMatchById(Number(id), {
      onSuccess: (data) => {
        setMatch(data)
        setIsLoading(false)
      },
      // No mostramos toast: el bloque de "no encontrado" de abajo
      // ya le explica al usuario qué pasó, sin duplicar el aviso.
      onError: () => setIsLoading(false),
    })
  }, [id])

  if (isLoading) {
    return <p className="text-muted">Cargando partido…</p>
  }

  // Segundo estado: el id no existe o falló la conexión.
  // Sin este bloque, el JSX de abajo rompería al leer match.homeClub de null.
  if (!match) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-muted">
          No se encontró información para el partido {id}.
        </p>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Volver al listado
        </Button>
      </div>
    )
  }

  return (
    <article className="max-w-xl rounded-xl border border-slate-200 bg-white p-6">
      <header className="flex items-center justify-between text-sm text-muted">
        <span className="font-medium">{CATEGORY_LABEL[match.category]}</span>
        <span>{formatShortDate(match.startsAt)}</span>
      </header>

      {/* items-start: si un nombre ocupa dos líneas, los escudos
          quedan igual a la misma altura. */}
      <div className="mt-6 flex items-start justify-center gap-6">
        <div className="flex flex-1 flex-col items-center gap-2 text-center">
          <ClubLogo
            name={match.homeClub.name}
            logoUrl={match.homeClub.logoUrl}
            size="lg"
          />
          <span className="text-lg font-bold text-navy">{match.homeClub.name}</span>
        </div>

        <span className="mt-6 font-semibold text-muted">vs</span>

        <div className="flex flex-1 flex-col items-center gap-2 text-center">
          <ClubLogo
            name={match.awayClub.name}
            logoUrl={match.awayClub.logoUrl}
            size="lg"
          />
          <span className="text-lg font-bold text-navy">{match.awayClub.name}</span>
        </div>
      </div>

      <dl className="mt-6 space-y-2 border-l-2 border-slate-200 pl-4 text-sm">
        <div>
          <dt className="font-semibold text-navy">Hora</dt>
          <dd className="text-muted">{formatTime(match.startsAt)} hs</dd>
        </div>
        <div>
          <dt className="font-semibold text-navy">Cancha</dt>
          <dd className="text-muted">{match.court.name}</dd>
        </div>
        <div>
          <dt className="font-semibold text-navy">Precio</dt>
          <dd className="text-muted">{formatPrice(match.price)}</dd>
        </div>
      </dl>

      <div className="mt-6 flex gap-2">
        <Button variant="secondary" onClick={() => navigate('/')}>
          Volver
        </Button>
        {/* La compra todavía no está implementada: el botón queda
            deshabilitado si el partido está agotado. */}
        <Button variant="primary" disabled={match.soldOut}>
          {match.soldOut ? 'Agotado' : 'Comprar entrada'}
        </Button>
      </div>
    </article>
  )
}