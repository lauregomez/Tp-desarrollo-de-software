import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { ClubSummary, CourtSummary } from '../../../types/match'

// Opciones para los desplegables. Los dos endpoints son públicos:
// sin sesión, /courts responde sin la capacidad, que acá no hace falta.
export const getClubOptions = ({ onSuccess, onError }: Callbacks<ClubSummary[]>) => {
  apiFetch<ClubSummary[]>('/clubs')
    .then(onSuccess)
    .catch(onError)
}

export const getCourtOptions = ({ onSuccess, onError }: Callbacks<CourtSummary[]>) => {
  apiFetch<CourtSummary[]>('/courts')
    .then(onSuccess)
    .catch(onError)
}