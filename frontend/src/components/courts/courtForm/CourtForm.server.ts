import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { Court } from '../../../types/court'

// Fallback para cuando se entra a /canchas/editar/:id sin state
// (link pegado en otra pestaña o marcador): ahí no hubo navegación previa.
export const getCourt = (id: string, { onSuccess, onError }: Callbacks<Court>) => {
  apiFetch<Court>(`/courts/${id}`)
    .then(onSuccess)
    .catch(onError)
}