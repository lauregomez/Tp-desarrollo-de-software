import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type {
  AdminMatch,
  CreateMatchDto,
  UpdateMatchDto,
  ClubSummary,
} from '../../../types/match'
import type { Court } from '../../../types/court'

const RESOURCE = '/matches'

export const getClubOptions = ({ onSuccess, onError }: Callbacks<ClubSummary[]>) => {
  apiFetch<ClubSummary[]>('/clubs')
    .then(onSuccess)
    .catch(onError)
}

export const getCourtOptions = ({ onSuccess, onError }: Callbacks<Court[]>) => {
  apiFetch<Court[]>('/courts')
    .then(onSuccess)
    .catch(onError)
}

export const getMatch = (
  id: number,
  { onSuccess, onError }: Callbacks<AdminMatch>,
) => {
  apiFetch<AdminMatch>(`${RESOURCE}/${id}`)
    .then(onSuccess)
    .catch(onError)
}

export const createMatch = (
  match: CreateMatchDto,
  { onSuccess, onError }: Callbacks<AdminMatch>,
) => {
  apiFetch<AdminMatch>(RESOURCE, {
    method: 'POST',
    body: JSON.stringify(match),
  })
    .then(onSuccess)
    .catch(onError)
}

export const updateMatch = (
  id: number,
  match: UpdateMatchDto,
  { onSuccess, onError }: Callbacks<AdminMatch>,
) => {
  apiFetch<AdminMatch>(`${RESOURCE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(match),
  })
    .then(onSuccess)
    .catch(onError)
}