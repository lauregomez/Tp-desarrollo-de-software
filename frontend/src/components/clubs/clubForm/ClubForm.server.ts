import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { Club } from '../../../types/club'

export const getClub = (id: string, { onSuccess, onError }: Callbacks<Club>) => {
  apiFetch<Club>(`/clubs/${id}`)
    .then(onSuccess)
    .catch(onError)
}