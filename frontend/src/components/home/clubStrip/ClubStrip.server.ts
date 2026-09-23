import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { Club } from '../../../types/club'

// GET /api/clubs es público en el backend (sin authenticate), así que
// la franja se ve también para un visitante sin sesión.
export const getClubs = ({ onSuccess, onError }: Callbacks<Club[]>) => {
  apiFetch<Club[]>('/clubs')
    .then(onSuccess)
    .catch(onError)
}