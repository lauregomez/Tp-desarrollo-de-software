import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { ClubSummary, CourtSummary, MatchFilterValues } from '../../../types/match'

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

export function buildMatchQuery(filters: MatchFilterValues): string {
  const params = new URLSearchParams()

  filters.statuses?.forEach((status) => params.append('status', status))
  filters.clubIds?.forEach((id) => params.append('clubId', String(id)))
  filters.courtIds?.forEach((id) => params.append('courtId', String(id)))
  if (filters.category) params.set('category', filters.category)
  if (filters.q) params.set('q', filters.q)
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)

  const query = params.toString()
  return query ? `?${query}` : ''
}