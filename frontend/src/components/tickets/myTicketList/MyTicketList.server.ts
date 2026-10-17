import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { Ticket, TicketDisplayStatus } from '../../../types/ticket'

const RESOURCE = '/tickets'

export const getMyTickets = (
  status: TicketDisplayStatus | '',
  { onSuccess, onError }: Callbacks<Ticket[]>,
) => {
  const query = status ? `?status=${status}` : ''

  apiFetch<Ticket[]>(`${RESOURCE}/me${query}`)
    .then(onSuccess)
    .catch(onError)
}