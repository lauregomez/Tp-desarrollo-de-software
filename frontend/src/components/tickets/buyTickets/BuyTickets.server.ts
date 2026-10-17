import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { Ticket } from '../../../types/ticket'

export interface PurchaseStart {
  ticketIds: number[]
  checkoutUrl: string
}

export const startPurchase = (
  matchId: number,
  quantity: number,
  { onSuccess, onError }: Callbacks<PurchaseStart>,
) => {
  apiFetch<Ticket[]>('/tickets/reserve', {
    method: 'POST',
    body: JSON.stringify({ matchId, quantity }),
  })
    .then(async (tickets) => {
      const ticketIds = tickets.map((ticket) => ticket.id)
      const { checkoutUrl } = await apiFetch<{ checkoutUrl: string }>(
        '/payments/orders',
        {
          method: 'POST',
          body: JSON.stringify({ ticketIds }),
        },
      )
      return { ticketIds, checkoutUrl }
    })
    .then(onSuccess)
    .catch(onError)
}