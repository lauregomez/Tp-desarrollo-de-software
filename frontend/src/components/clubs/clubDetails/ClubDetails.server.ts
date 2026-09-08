import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { Club } from '../../../types/club'

// Mismo fallback que en ClubForm: si se entra directo a /clubes/:id
// o se recarga la página, el state de navigate no está y hay que
// pedir el club por su id.
export const getClub = (id: string, { onSuccess, onError }: Callbacks<Club>) => {
  apiFetch<Club>(`/clubs/${id}`)
    .then(onSuccess)
    .catch(onError)
}