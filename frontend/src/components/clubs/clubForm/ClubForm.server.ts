import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { Club } from '../../../types/club'

// Fallback para cuando se entra a /clubes/editar/:id sin state
// (F5 o link directo): el state de navigate no sobrevive a una recarga.
export const getClub = (id: string, { onSuccess, onError }: Callbacks<Club>) => {
  apiFetch<Club>(`/clubs/${id}`)
    .then(onSuccess)
    .catch(onError)
}