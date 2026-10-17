import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import Button from '../../shared/button/Button'
import { getMatchById } from './MatchDetails.server'
import ClubLogo from '../../shared/clubLogo/ClubLogo'
import BuyTickets from '../../tickets/buyTickets/BuyTickets'
import MatchWeather from '../matchWeather/MatchWeather'
import { CATEGORY_LABEL } from '../../../types/match'
import type { PublicMatch } from '../../../types/match'
import { formatPrice, formatShortDate, formatTime } from '../../../lib/format'

export default function MatchDetails() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [match, setMatch] = useState<PublicMatch | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(id))

  useEffect(() => {
    if (!id) return

    getMatchById(Number(id), {
      onSuccess: (data) => {
        setMatch(data)
        setIsLoading(false)
      },
      onError: () => setIsLoading(false),
    })
  }, [id])

  if (isLoading) {
    return <p className="text-muted">Cargando partido…</p>
  }

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
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      <article className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 md:flex-1">
        <header className="flex items-center justify-between text-sm text-muted">
          <span className="font-medium">{CATEGORY_LABEL[match.category]}</span>
          <span>{formatShortDate(match.startsAt)}</span>
        </header>

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
            <dd className="text-muted">{match.court.address}</dd>
          </div>
          <div>
            <dt className="font-semibold text-navy">Precio</dt>
            <dd className="text-muted">{formatPrice(match.price)}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button variant="secondary" onClick={() => navigate('/')}>
            Volver
          </Button>
          <BuyTickets matchId={match.id} soldOut={match.soldOut} />
        </div>
      </article>

      <div className="w-full max-w-xl md:w-72 md:shrink-0">
        <MatchWeather matchId={match.id} />
      </div>
    </div>
  )
}