import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { User, CreateUserDto, UpdateUserDto } from '../../../types/user'

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

export const deactivateUser = (
  id: number,
  { onSuccess, onError }: Callbacks<User>,
) => {
  apiFetch<User>(`${RESOURCE}/${id}/deactivate`, { method: 'PATCH' })
    .then(onSuccess)
    .catch(onError)
}

export const activateUser = (
  id: number,
  { onSuccess, onError }: Callbacks<User>,
) => {
  apiFetch<User>(`${RESOURCE}/${id}/activate`, { method: 'PATCH' })
    .then(onSuccess)
    .catch(onError)
}