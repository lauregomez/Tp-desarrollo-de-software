import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { Ticket } from '../../../types/ticket'

// Fallback para cuando se entra a /mis-entradas/:id sin state
// (link pegado en otra pestaña o marcador): ahí no hubo navegación previa.
//
// El backend chequea la propiedad de la entrada dentro del controller:
// si el id no es tuyo responde 404, igual que si no existiera, para no
// revelar que la entrada existe. Por eso no hace falta validar acá.
export const getMyTicket = (id: string, { onSuccess, onError }: Callbacks<Ticket>) => {
  apiFetch<Ticket>(`/tickets/${id}`)
    .then(onSuccess)
    .catch(onError)
}