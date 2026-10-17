import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { Club } from '../../../types/club'

export const getClubs = ({ onSuccess, onError }: Callbacks<Club[]>) => {
  apiFetch<Club[]>('/clubs')
    .then(onSuccess)
    .catch(onError)
}