import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { Ticket } from '../../../types/ticket'

export const getTicket = (id: number, { onSuccess, onError }: Callbacks<Ticket>) => {
  apiFetch<Ticket>(`/tickets/${id}`)
    .then(onSuccess)
    .catch(onError)
}