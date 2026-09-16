import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { Court } from '../../../types/court'

// Fallback para cuando se entra directo a /canchas/:id o se recarga la página:
// en ese caso no llega la cancha en el state de la navegación y hay que pedirla.
export const getCourt = (id: string, { onSuccess, onError }: Callbacks<Court>) => {
  apiFetch<Court>(`/courts/${id}`)
    .then(onSuccess)
    .catch(onError)
}