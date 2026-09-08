import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { Club, CreateClubDto, UpdateClubDto } from '../../../types/club'

// Ruta base del recurso. apiFetch le antepone VITE_API_URL,
// así que acá va sólo la parte propia del endpoint.
const RESOURCE = '/clubs'

// Este archivo no sabe nada de React: no importa hooks ni toca el estado.
// Sólo hace el pedido y avisa el resultado por los callbacks que le pasa
// el componente (patrón onSuccess/onError).
// Usamos apiFetch en vez de fetch directo por dos motivos:
//  1. adjunta el JWT, necesario en POST/PUT/DELETE (requieren rol ADMIN)
//  2. convierte los 4xx/5xx en ApiError con el message del backend,
//     que fetch dejaría pasar como si fuera una respuesta válida.

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

// El backend responde 204 sin cuerpo, así que no hay nada que devolver.
// Le pasamos al onSuccess el id que ya teníamos, para que el componente
// pueda sacar el club de la lista sin volver a pedirla entera.
export const deleteClub = (
  id: number,
  { onSuccess, onError }: Callbacks<number>,
) => {
  apiFetch<void>(`${RESOURCE}/${id}`, { method: 'DELETE' })
    .then(() => onSuccess(id))
    .catch(onError)
}