import type { Callbacks } from '../../../lib/api'
import { apiFetch } from '../../../lib/api'
import type { Club } from '../../../types/club'
import type { Court, CreateCourtDto } from '../../../types/court'

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

// Pedimos los clubes desde acá y no importando de ClubList.server:
// así esta pantalla no depende de un archivo de otra sección que puede cambiar.
export const getClubs = ({ onSuccess, onError }: Callbacks<Club[]>) => {
  apiFetch<Club[]>('/clubs')
    .then(onSuccess)
    .catch(onError)
}