import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { Ticket } from '../../../types/ticket'

// Lo que necesita el componente para seguir: los ids, para guardarlos y
// consultarlos al volver de MercadoPago, y la URL del checkout.
export interface PurchaseStart {
  ticketIds: number[]
  checkoutUrl: string
}

// Inicia una compra en dos pasos:
// 1. POST /tickets/reserve crea las entradas PENDING.
// 2. POST /payments/orders crea la orden de MercadoPago con esos ids.
//
// Se encadenan acá y no en el componente para no anidar callbacks.
// Si el paso 2 falla, las PENDING quedan sin orden: no ocupan lugar, así
// que el usuario puede volver a intentar sin que se le bloquee nada.
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