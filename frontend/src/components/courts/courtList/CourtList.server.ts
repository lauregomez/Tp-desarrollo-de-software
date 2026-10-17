import type { Callbacks } from '../../../lib/api'
import { apiFetch } from '../../../lib/api'
import type { Club } from '../../../types/club'
import type { Court, CreateCourtDto, UpdateCourtDto } from '../../../types/court'

const RESOURCE = '/courts'

export const getCourts = ({ onSuccess, onError }: Callbacks<Court[]>) => {
  apiFetch<Court[]>(RESOURCE)
    .then(onSuccess)
    .catch(onError)
}

export const createCourt = (
  court: CreateCourtDto,
  { onSuccess, onError }: Callbacks<Court>,
) => {
  apiFetch<Court>(RESOURCE, {
    method: 'POST',
    body: JSON.stringify(court),
  })
    .then(onSuccess)
    .catch(onError)
}

export const updateCourt = (
  id: number,
  court: UpdateCourtDto,
  { onSuccess, onError }: Callbacks<Court>,
) => {
  apiFetch<Court>(`${RESOURCE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(court),
  })
    .then(onSuccess)
    .catch(onError)
}

export const deleteCourt = (
  id: number,
  { onSuccess, onError }: Callbacks<number>,
) => {
  apiFetch<void>(`${RESOURCE}/${id}`, { method: 'DELETE' })
    .then(() => onSuccess(id))
    .catch(onError)
}

export const getClubs = ({ onSuccess, onError }: Callbacks<Club[]>) => {
  apiFetch<Club[]>('/clubs')
    .then(onSuccess)
    .catch(onError)
}