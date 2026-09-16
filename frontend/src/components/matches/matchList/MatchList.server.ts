import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { PublicMatch, Category, MatchStatus } from '../../../types/match'

// Ruta base del recurso. apiFetch le antepone VITE_API_URL,
// así que acá va sólo la parte propia del endpoint.
const RESOURCE = '/matches'

// Filtros que acepta GET /api/matches.
// Son todos opcionales: sin ninguno, el backend devuelve el listado completo.
export interface MatchFilters {
  status?: MatchStatus
  category?: Category
  clubId?: number
}

// Arma el query string salteando los filtros vacíos.
// Sin este salteo mandaríamos ?status=&category= y el backend
// interpretaría el string vacío como un filtro válido.
function buildQuery(filters: MatchFilters): string {
  const params = new URLSearchParams()

  if (filters.status) params.set('status', filters.status)
  if (filters.category) params.set('category', filters.category)
  if (filters.clubId) params.set('clubId', String(filters.clubId))

  const query = params.toString()
  return query ? `?${query}` : ''
}

// Este archivo no sabe nada de React: no importa hooks ni toca el estado.
// Sólo hace el pedido y avisa el resultado por los callbacks que le pasa
// el componente (patrón onSuccess/onError).
//
// La ruta usa optionalAuthenticate en el backend: si no hay token devuelve
// la proyección pública (sin la capacidad de la cancha, sólo soldOut).
// Por eso el tipo de retorno es PublicMatch y no AdminMatch.
export const getMatches = (
  filters: MatchFilters,
  { onSuccess, onError }: Callbacks<PublicMatch[]>,
) => {
  apiFetch<PublicMatch[]>(`${RESOURCE}${buildQuery(filters)}`)
    .then(onSuccess)
    .catch(onError)
}