import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import Button from '../../shared/button/Button'
import MultiSelect from '../../shared/multiSelect/MultiSelect'
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

// Opciones de estado para el MultiSelect, armadas una sola vez.
const STATUS_OPTIONS = (Object.keys(STATUS_LABEL) as MatchStatus[]).map((status) => ({
  value: status,
  label: STATUS_LABEL[status],
}))

// Una lista vacía pasa a undefined: así ese filtro no se manda
// y la pantalla sabe que no hay nada elegido.
const orUndefined = <T,>(values: T[]) => (values.length > 0 ? values : undefined)

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
      <MultiSelect
        label="Club"
        options={clubs.map((club) => ({ value: club.id, label: club.name }))}
        selected={filters.clubIds ?? []}
        onChange={(ids) => onChange({ ...filters, clubIds: orUndefined(ids) })}
      />

      {showStatus && (
        <MultiSelect
          label="Estado"
          options={STATUS_OPTIONS}
          selected={filters.statuses ?? []}
          onChange={(statuses) => onChange({ ...filters, statuses: orUndefined(statuses) })}
        />
      )}

      <MultiSelect
        label="Cancha"
        options={courts.map((court) => ({ value: court.id, label: court.name }))}
        selected={filters.courtIds ?? []}
        onChange={(ids) => onChange({ ...filters, courtIds: orUndefined(ids) })}
      />

      <div className="flex flex-1 gap-2">
        <input
          type="search"
          aria-label="Buscar por club o cancha"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar club o cancha"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        />
        <Button type="submit" aria-label="Buscar">
          {/* Ícono de lupa dibujado en SVG: no agrega ninguna librería. */}
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </Button>
      </div>
    </form>
  )
}