import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import Button from '../../shared/button/Button'
import { errorToast } from '../../../shared/notifications'
import { getClubOptions, getCourtOptions } from './MatchFilters.server'
import { STATUS_LABEL } from '../../../types/match'
import type {
  ClubSummary,
  CourtSummary,
  MatchFilterValues,
  MatchStatus,
} from '../../../types/match'

interface MatchFiltersProps {
  filters: MatchFilterValues
  onChange: (filters: MatchFilterValues) => void
  // El listado público no muestra el estado: ahí solo hay partidos publicados.
  showStatus?: boolean
}

const inputClass = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm'

// Los <select> devuelven string. '' es la opción "Todos" y pasa a undefined
// para que ese filtro no se mande.
const toId = (value: string) => (value ? Number(value) : undefined)

export default function MatchFilters({
  filters,
  onChange,
  showStatus = false,
}: MatchFiltersProps) {
  const [clubs, setClubs] = useState<ClubSummary[]>([])
  const [courts, setCourts] = useState<CourtSummary[]>([])
  // El texto vive aparte y se aplica recién al buscar: si se aplicara en
  // cada tecla, habría un pedido al backend por cada letra.
  const [search, setSearch] = useState(filters.q ?? '')

  useEffect(() => {
    getClubOptions({ onSuccess: setClubs, onError: (error) => errorToast(error.message) })
    getCourtOptions({ onSuccess: setCourts, onError: (error) => errorToast(error.message) })
  }, [])

  // Enter en el input o click en la lupa: los dos envían el form.
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onChange({ ...filters, q: search.trim() || undefined })
  }

  return (
    <form
      onSubmit={handleSearch}
      className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-end"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-club" className="text-sm font-medium">
          Club
        </label>
        <select
          id="filter-club"
          value={filters.clubId ?? ''}
          onChange={(e) => onChange({ ...filters, clubId: toId(e.target.value) })}
          className={inputClass}
        >
          <option value="">Todos</option>
          {clubs.map((club) => (
            <option key={club.id} value={club.id}>
              {club.name}
            </option>
          ))}
        </select>
      </div>

      {showStatus && (
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-status" className="text-sm font-medium">
            Estado
          </label>
          <select
            id="filter-status"
            value={filters.status ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                status: (e.target.value || undefined) as MatchStatus | undefined,
              })
            }
            className={inputClass}
          >
            <option value="">Todos</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-court" className="text-sm font-medium">
          Cancha
        </label>
        <select
          id="filter-court"
          value={filters.courtId ?? ''}
          onChange={(e) => onChange({ ...filters, courtId: toId(e.target.value) })}
          className={inputClass}
        >
          <option value="">Todas</option>
          {courts.map((court) => (
            <option key={court.id} value={court.id}>
              {court.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="filter-q" className="text-sm font-medium">
          Buscar
        </label>
        <div className="flex gap-2">
          <input
            id="filter-q"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Club o cancha"
            className={`${inputClass} flex-1`}
          />
          <Button type="submit" aria-label="Buscar">
            {/* Ícono de lupa dibujado en SVG: no agrega ninguna librería. */}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </Button>
        </div>
      </div>
    </form>
  )
}