import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import { getMatches } from '../../matches/matchList/MatchList.server'
import type { PublicMatch } from '../../../types/match'
import type { ValidateTicketResponse } from '../../../types/ticket'

function todayRange(): { from: string; to: string } {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setHours(23, 59, 59, 999)
  return { from: start.toISOString(), to: end.toISOString() }
}

export const getTodayMatches = (callbacks: Callbacks<PublicMatch[]>) => {
  const { from, to } = todayRange()
  getMatches({ statuses: ['PUBLISHED'], from, to }, callbacks)
}

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