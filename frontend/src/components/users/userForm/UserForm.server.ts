import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { User } from '../../../types/user'

const RESOURCE = '/users'

// Fallback para la edición: si se entra por link directo o se recarga
// la página, el usuario no viene en el state y hay que pedirlo.
export const getUser = (
  id: number,
  { onSuccess, onError }: Callbacks<User>,
) => {
  apiFetch<User>(`${RESOURCE}/${id}`)
    .then(onSuccess)
    .catch(onError)
}