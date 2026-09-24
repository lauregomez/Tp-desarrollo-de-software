import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { Ticket } from '../../../types/ticket'

// Consulta una entrada de la compra en curso para saber si el webhook ya
// confirmó el pago. Devuelve 404 si la entrada no existe: pasa cuando el
// pago se rechazó y el backend borró las PENDING de esa orden.
export const getTicket = (id: number, { onSuccess, onError }: Callbacks<Ticket>) => {
  apiFetch<Ticket>(`/tickets/${id}`)
    .then(onSuccess)
    .catch(onError)
}