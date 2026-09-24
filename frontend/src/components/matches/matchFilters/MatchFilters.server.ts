import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { ClubSummary, CourtSummary, MatchFilterValues } from '../../../types/match'

// Opciones para los desplegables. Los dos endpoints son públicos:
// sin sesión, /courts responde sin la capacidad, que acá no hace falta.
export const getClubOptions = ({ onSuccess, onError }: Callbacks<ClubSummary[]>) => {
  apiFetch<ClubSummary[]>('/clubs')
    .then(onSuccess)
    .catch(onError)
}

export const getCourtOptions = ({ onSuccess, onError }: Callbacks<CourtSummary[]>) => {
  apiFetch<CourtSummary[]>('/courts')
    .then(onSuccess)
    .catch(onError)
}

// Arma el query string de GET /api/matches salteando los filtros vacíos.
// Las listas van como parámetro repetido (?clubId=3&clubId=7): Express
// las recibe como array. La usan el listado y Gestión.
export function buildMatchQuery(filters: MatchFilterValues): string {
  const params = new URLSearchParams()

  filters.statuses?.forEach((status) => params.append('status', status))
  filters.clubIds?.forEach((id) => params.append('clubId', String(id)))
  filters.courtIds?.forEach((id) => params.append('courtId', String(id)))
  if (filters.category) params.set('category', filters.category)
  if (filters.q) params.set('q', filters.q)

  const query = params.toString()
  return query ? `?${query}` : ''
}