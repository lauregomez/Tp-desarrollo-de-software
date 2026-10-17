import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { Club, CreateClubDto, UpdateClubDto } from '../../../types/club'

const RESOURCE = '/clubs'

export const getClubs = ({ onSuccess, onError }: Callbacks<Club[]>) => {
  apiFetch<Club[]>(RESOURCE)
    .then(onSuccess)
    .catch(onError)
}

export const createClub = (
  club: CreateClubDto,
  { onSuccess, onError }: Callbacks<Club>,
) => {
  apiFetch<Club>(RESOURCE, {
    method: 'POST',
    body: JSON.stringify(club),
  })
    .then(onSuccess)
    .catch(onError)
}

export const updateClub = (
  id: number,
  club: UpdateClubDto,
  { onSuccess, onError }: Callbacks<Club>,
) => {
  apiFetch<Club>(`${RESOURCE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(club),
  })
    .then(onSuccess)
    .catch(onError)
}

export const deleteClub = (
  id: number,
  { onSuccess, onError }: Callbacks<number>,
) => {
  apiFetch<void>(`${RESOURCE}/${id}`, { method: 'DELETE' })
    .then(() => onSuccess(id))
    .catch(onError)
}