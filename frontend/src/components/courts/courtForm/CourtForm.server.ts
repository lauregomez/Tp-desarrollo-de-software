import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { Court } from '../../../types/court'

export const getCourt = (id: string, { onSuccess, onError }: Callbacks<Court>) => {
  apiFetch<Court>(`/courts/${id}`)
    .then(onSuccess)
    .catch(onError)
}