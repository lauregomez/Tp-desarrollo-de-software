import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { AdminMatch, MatchStatus, MatchFilterValues } from '../../../types/match'
import { buildMatchQuery } from '../matchFilters/MatchFilters.server'

const RESOURCE = '/matches'

export const getAdminMatches = (
  filters: MatchFilterValues,
  { onSuccess, onError }: Callbacks<AdminMatch[]>,
) => {
  apiFetch<AdminMatch[]>(`${RESOURCE}${buildMatchQuery(filters)}`)
    .then(onSuccess)
    .catch(onError)
}

export const deleteMatch = (
  id: number,
  { onSuccess, onError }: Callbacks<number>,
) => {
  apiFetch<void>(`${RESOURCE}/${id}`, { method: 'DELETE' })
    .then(() => onSuccess(id))
    .catch(onError)
}

export const changeMatchStatus = (
  id: number,
  status: MatchStatus,
  { onSuccess, onError }: Callbacks<AdminMatch>,
) => {
  apiFetch<AdminMatch>(`${RESOURCE}/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
    .then(onSuccess)
    .catch(onError)
}
