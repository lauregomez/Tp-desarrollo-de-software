import { useEffect, useState } from 'react'

import MatchCard from '../matchCard/MatchCard'
import { errorToast } from '../../../shared/notifications'
import { getMatches } from './MatchList.server'
import type { PublicMatch } from '../../../types/match'

export default function MatchList() {
  const [matches, setMatches] = useState<PublicMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Carga inicial. El array de dependencias vacío hace que corra
  // una sola vez, al montar el componente.
  useEffect(() => {
    // Sólo se listan los partidos publicados: los DRAFT no deben
    // verse en la pantalla pública, y los CANCELLED/FINISHED no se venden.
    getMatches(
      { status: 'PUBLISHED' },
      {
        onSuccess: (data) => {
          setMatches(data)
          setIsLoading(false)
        },
        // error.message viene del backend, o del propio apiFetch
        // si el servidor está apagado.
        onError: (error) => {
          errorToast(error.message)
          setIsLoading(false)
        },
      },
    )
  }, [])

  // Usamos el id del backend como key, nunca el índice del array.
  const matchesMapped = matches.map((match) => (
    <MatchCard key={match.id} match={match} />
  ))

  return (
    <section>
      <h1 className="sr-only">Partidos</h1>

      {isLoading ? (
        <p className="text-muted">Cargando partidos…</p>
      ) : matchesMapped.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matchesMapped}
        </div>
      ) : (
        <p className="text-muted">No hay partidos disponibles por el momento.</p>
      )}
    </section>
  )
}