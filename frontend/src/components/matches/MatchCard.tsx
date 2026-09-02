    import { Link } from 'react-router-dom'
import type { PublicMatch } from '../../types/match'
import { CATEGORY_LABEL } from '../../types/match'
import { formatPrice, formatShortDate, formatTime } from '../../lib/format'

interface MatchCardProps {
  match: PublicMatch
}

function ClubBadge({ name }: { name: string }) {
  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-500"
      aria-hidden="true"
    >
      {name.slice(0, 3).toUpperCase()}
    </div>
  )
}

export default function MatchCard({ match }: MatchCardProps) {
  const { homeClub, awayClub, court, soldOut } = match

  return (
    <article
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white ${
        soldOut ? 'opacity-60' : ''
      }`}
    >
      <header className="flex items-center justify-between bg-primary px-4 py-2 text-sm text-white">
        <span className="font-medium">{CATEGORY_LABEL[match.category]}</span>
        <span>{formatShortDate(match.startsAt)}</span>
      </header>

      <div className="p-4">
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <ClubBadge name={homeClub.name} />
            <span className="font-semibold">{homeClub.name}</span>
          </div>
          <span className="text-sm text-muted">vs</span>
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <ClubBadge name={awayClub.name} />
            <span className="font-semibold">{awayClub.name}</span>
          </div>
        </div>

        <dl className="mt-4 space-y-1 border-l-2 border-slate-200 pl-3 text-sm text-muted">
          <div>
            <dt className="sr-only">Hora</dt>
            <dd>{formatTime(match.startsAt)} hs</dd>
          </div>
          <div>
            <dt className="sr-only">Cancha</dt>
            <dd>{court.name}</dd>
          </div>
        </dl>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3">
        <span className="text-xl font-bold">{formatPrice(match.price)}</span>
        {soldOut ? (
          <span className="rounded-full bg-brand px-3 py-1.5 text-sm font-semibold text-white">
            Agotado
          </span>
        ) : (
          <Link
            to={`/partidos/${match.id}`}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110"
          >
            Comprar entrada
          </Link>
        )}
      </footer>
    </article>
  )
}