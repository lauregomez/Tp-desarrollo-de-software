import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { User } from '../../../types/user'

const RESOURCE = '/users'

export const getUser = (
  id: number,
  { onSuccess, onError }: Callbacks<User>,
) => {
  apiFetch<User>(`${RESOURCE}/${id}`)
    .then(onSuccess)
    .catch(onError)
}