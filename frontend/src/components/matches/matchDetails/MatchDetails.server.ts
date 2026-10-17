import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { PublicMatch } from '../../../types/match'

const RESOURCE = '/matches'

export const getMatchById = (
  id: number,
  { onSuccess, onError }: Callbacks<PublicMatch>,
) => {
  apiFetch<PublicMatch>(`${RESOURCE}/${id}`)
    .then(onSuccess)
    .catch(onError)
}