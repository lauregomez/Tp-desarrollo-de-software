import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { Ticket, TicketStatus } from '../../../types/ticket'

// Ruta base del recurso. apiFetch le antepone VITE_API_URL,
// así que acá va sólo la parte propia del endpoint.
const RESOURCE = '/tickets'

// Este archivo no sabe nada de React: no importa hooks ni toca el estado.
// Sólo hace el pedido y avisa el resultado por los callbacks que le pasa
// el componente (patrón onSuccess/onError).
//
// La ruta /tickets/me exige token: el backend saca el usuario del JWT y
// nunca del cliente, así que es imposible pedir las entradas de otro.
// apiFetch adjunta ese token en cada llamada.
export const getMyTickets = (
  status: TicketStatus | '',
  { onSuccess, onError }: Callbacks<Ticket[]>,
) => {
  // Con status vacío no mandamos el parámetro: el backend interpretaría
  // ?status= como un estado inválido y responderÍa 400.
  const query = status ? `?status=${status}` : ''

  apiFetch<Ticket[]>(`${RESOURCE}/me${query}`)
    .then(onSuccess)
    .catch(onError)
}