import type { Callbacks } from '../../../lib/api'
import { apiFetch } from '../../../lib/api'
import type { Club } from '../../../types/club'
import type { Court, CreateCourtDto, UpdateCourtDto } from '../../../types/court'

// Ruta base del recurso. apiFetch le antepone VITE_API_URL,
// así que acá va sólo la parte propia del endpoint.
const RESOURCE = '/courts'

// Este archivo no sabe nada de React: no importa hooks ni toca el estado.
// Sólo hace el pedido y avisa el resultado por los callbacks que le pasa
// el componente (patrón onSuccess/onError).
// Usamos apiFetch en vez de fetch directo por dos motivos:
//  1. adjunta el JWT, necesario en POST/PUT/DELETE (requieren rol ADMIN)
//  2. convierte los 4xx/5xx en ApiError con el message del backend,
//     que fetch dejaría pasar como si fuera una respuesta válida.
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

// El backend responde 204 sin cuerpo, así que no hay nada que devolver.
// Le pasamos al onSuccess el id que ya teníamos, para que el componente
// pueda sacar la cancha de la lista sin volver a pedirla entera.
export const deleteCourt = (
  id: number,
  { onSuccess, onError }: Callbacks<number>,
) => {
  apiFetch<void>(`${RESOURCE}/${id}`, { method: 'DELETE' })
    .then(() => onSuccess(id))
    .catch(onError)
}

// Pedimos los clubes desde acá y no importando de ClubList.server:
// así esta pantalla no depende de un archivo de otra sección que puede cambiar.
export const getClubs = ({ onSuccess, onError }: Callbacks<Club[]>) => {
  apiFetch<Club[]>('/clubs')
    .then(onSuccess)
    .catch(onError)
}