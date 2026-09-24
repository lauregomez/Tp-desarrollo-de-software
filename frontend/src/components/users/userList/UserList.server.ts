import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { User, CreateUserDto, UpdateUserDto } from '../../../types/user'

// Todas las rutas de este recurso piden rol ADMIN en el backend.
const RESOURCE = '/users'

export const getUsers = ({ onSuccess, onError }: Callbacks<User[]>) => {
  apiFetch<User[]>(RESOURCE)
    .then(onSuccess)
    .catch(onError)
}

export const createUser = (
  user: CreateUserDto,
  { onSuccess, onError }: Callbacks<User>,
) => {
  apiFetch<User>(RESOURCE, {
    method: 'POST',
    body: JSON.stringify(user),
  })
    .then(onSuccess)
    .catch(onError)
}

export const updateUser = (
  id: number,
  user: UpdateUserDto,
  { onSuccess, onError }: Callbacks<User>,
) => {
  apiFetch<User>(`${RESOURCE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(user),
  })
    .then(onSuccess)
    .catch(onError)
}

// El backend responde 204 sin cuerpo, así que le pasamos al onSuccess
// el id que ya teníamos para sacar el usuario de la lista sin volver
// a pedirla entera.
export const deleteUser = (
  id: number,
  { onSuccess, onError }: Callbacks<number>,
) => {
  apiFetch<void>(`${RESOURCE}/${id}`, { method: 'DELETE' })
    .then(() => onSuccess(id))
    .catch(onError)
}