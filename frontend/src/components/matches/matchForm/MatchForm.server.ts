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

// El formulario necesita las listas de clubes y canchas para llenar
// los desplegables. Son dos recursos distintos del backend, así que
// van dos funciones separadas.
export const getClubOptions = ({ onSuccess, onError }: Callbacks<ClubSummary[]>) => {
  apiFetch<ClubSummary[]>('/clubs')
    .then(onSuccess)
    .catch(onError)
}

// GET /api/courts devuelve la cancha completa (con address), no el resumen
// { id, name } que viaja dentro de un partido. Se tipa como Court para poder
// mostrar la dirección y distinguir canchas con el mismo nombre.
export const getCourtOptions = ({ onSuccess, onError }: Callbacks<Court[]>) => {
  apiFetch<Court[]>('/courts')
    .then(onSuccess)
    .catch(onError)
}

// Fallback para la edición: si se entra por link directo o se recarga
// la página, el partido no viene en el state y hay que pedirlo.
// Como la ruta está protegida por rol ADMIN, el backend responde
// con la proyección de admin.
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