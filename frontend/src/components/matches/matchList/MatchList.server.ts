import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import { buildMatchQuery } from '../matchFilters/MatchFilters.server'
import type { PublicMatch, MatchFilterValues } from '../../../types/match'

// Ruta base del recurso. apiFetch le antepone VITE_API_URL,
// así que acá va sólo la parte propia del endpoint.
const RESOURCE = '/matches'

// Este archivo no sabe nada de React: no importa hooks ni toca el estado.
// Sólo hace el pedido y avisa el resultado por los callbacks que le pasa
// el componente (patrón onSuccess/onError).
//
// La ruta usa optionalAuthenticate en el backend: si no hay token devuelve
// la proyección pública (sin la capacidad de la cancha, sólo soldOut).
// Por eso el tipo de retorno es PublicMatch y no AdminMatch.
export const getMatches = (
  filters: MatchFilterValues,
  { onSuccess, onError }: Callbacks<PublicMatch[]>,
) => {
  apiFetch<PublicMatch[]>(`${RESOURCE}${buildMatchQuery(filters)}`)
    .then(onSuccess)
    .catch(onError)
}