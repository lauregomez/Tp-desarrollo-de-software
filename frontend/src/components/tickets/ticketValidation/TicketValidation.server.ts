import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import { getMatches } from '../../matches/matchList/MatchList.server'
import type { PublicMatch } from '../../../types/match'
import type { ValidateTicketResponse } from '../../../types/ticket'

// Principio y fin del día de hoy en la hora local del navegador, como
// instantes ISO. setHours trabaja en hora local y toISOString pasa a UTC:
// en Rosario, hoy 00:00 viaja como 03:00Z.
function todayRange(): { from: string; to: string } {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setHours(23, 59, 59, 999)
  return { from: start.toISOString(), to: end.toISOString() }
}

// Partidos que el operador puede atender hoy. Se pide PUBLISHED
// explícitamente por el ADMIN: al OPERATOR el backend ya le muestra sólo
// publicados, pero al ADMIN le devuelve todos los estados si no filtra,
// y validar contra un partido no publicado siempre da error.
export const getTodayMatches = (callbacks: Callbacks<PublicMatch[]>) => {
  const { from, to } = todayRange()
  getMatches({ statuses: ['PUBLISHED'], from, to }, callbacks)
}

// POST /tickets/validate. Ante 400/404/409 apiFetch lanza ApiError con el
// mensaje del backend, que llega por onError.
export const validateTicket = (
  matchId: number,
  code: string,
  { onSuccess, onError }: Callbacks<ValidateTicketResponse>,
) => {
  apiFetch<ValidateTicketResponse>('/tickets/validate', {
    method: 'POST',
    body: JSON.stringify({ matchId, code }),
  })
    .then(onSuccess)
    .catch(onError)
}