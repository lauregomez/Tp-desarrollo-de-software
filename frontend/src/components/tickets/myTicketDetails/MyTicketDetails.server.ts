import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { Ticket } from '../../../types/ticket'

export const getMyTicket = (id: string, { onSuccess, onError }: Callbacks<Ticket>) => {
  apiFetch<Ticket>(`/tickets/${id}`)
    .then(onSuccess)
    .catch(onError)
}