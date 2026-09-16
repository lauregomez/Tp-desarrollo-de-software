import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { PublicMatch } from '../../../types/match'

const RESOURCE = '/matches'

// GET /api/matches/:id usa optionalAuthenticate igual que el listado:
// sin token devuelve la proyección pública, que es la que necesita
// esta pantalla. Por eso el tipo es PublicMatch.
//
// Si el id no existe, apiFetch lanza ApiError con status 404 y el
// componente lo trata como "partido no encontrado".
export const getMatchById = (
  id: number,
  { onSuccess, onError }: Callbacks<PublicMatch>,
) => {
  apiFetch<PublicMatch>(`${RESOURCE}/${id}`)
    .then(onSuccess)
    .catch(onError)
}