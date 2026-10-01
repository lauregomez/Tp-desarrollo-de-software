import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { MatchWeather } from '../../../types/weather'

const RESOURCE = '/matches'

// Usa optionalAuthenticate como GET /api/matches/:id: un admin con token
// también recibe el clima de partidos no publicados. Si el partido no es
// visible responde 404 y cae en el onError.
export const getMatchWeather = (
  matchId: number,
  { onSuccess, onError }: Callbacks<MatchWeather>,
) => {
  apiFetch<MatchWeather>(`${RESOURCE}/${matchId}/weather`)
    .then(onSuccess)
    .catch(onError)
}
