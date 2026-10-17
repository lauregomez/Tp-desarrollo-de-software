import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import { buildMatchQuery } from '../matchFilters/MatchFilters.server'
import type { PublicMatch, MatchFilterValues } from '../../../types/match'

const RESOURCE = '/matches'

export const getMatches = (
  filters: MatchFilterValues,
  { onSuccess, onError }: Callbacks<PublicMatch[]>,
) => {
  apiFetch<PublicMatch[]>(`${RESOURCE}${buildMatchQuery(filters)}`)
    .then(onSuccess)
    .catch(onError)
}