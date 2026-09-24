import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { AdminMatch, MatchStatus, MatchFilterValues } from '../../../types/match'
import { buildMatchQuery } from '../matchFilters/MatchFilters.server'

const RESOURCE = '/matches'

// Con token de ADMIN el backend devuelve todos los estados
// (no sólo PUBLISHED) y usa la proyección toAdminMatch.
export const getAdminMatches = (
  filters: MatchFilterValues,
  { onSuccess, onError }: Callbacks<AdminMatch[]>,
) => {
  apiFetch<AdminMatch[]>(`${RESOURCE}${buildMatchQuery(filters)}`)
    .then(onSuccess)
    .catch(onError)
}

// El backend responde 204 sin cuerpo, así que le pasamos al onSuccess
// el id que ya teníamos para sacar el partido de la lista sin
// volver a pedirla entera.
export const deleteMatch = (
  id: number,
  { onSuccess, onError }: Callbacks<number>,
) => {
  apiFetch<void>(`${RESOURCE}/${id}`, { method: 'DELETE' })
    .then(() => onSuccess(id))
    .catch(onError)
}

// PATCH /api/matches/:id/status. El backend valida la transición contra
// su propio ALLOWED_TRANSITIONS y responde 409 si no está permitida.
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
