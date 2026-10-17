import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { MatchWeather } from '../../../types/weather'

const RESOURCE = '/matches'

export const getMatchWeather = (
  matchId: number,
  { onSuccess, onError }: Callbacks<MatchWeather>,
) => {
  apiFetch<MatchWeather>(`${RESOURCE}/${matchId}/weather`)
    .then(onSuccess)
    .catch(onError)
}
