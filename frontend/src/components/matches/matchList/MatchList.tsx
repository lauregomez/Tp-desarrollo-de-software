import { useEffect, useState } from 'react'
import MatchCard from '../matchCard/MatchCard'
import { errorToast } from '../../../shared/notifications'
import { getMatches } from './MatchList.server'
import Hero from '../../home/hero/Hero'
import EmptyState from '../../shared/emptyState/EmptyState'
import type { PublicMatch } from '../../../types/match'
import ClubStrip from '../../home/clubStrip/ClubStrip'

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
     <>
       <Hero />

       {/* id: destino del botón "Ver próximos partidos" del hero.
           scroll-mt deja aire arriba al saltar, para que el título no quede
           pegado al borde de la ventana. */}
       <section id="partidos" className="scroll-mt-6">
         {/* h2 y no h1: el título principal de la página es el del hero. */}
         <h2 className="mb-4 text-2xl font-bold text-navy">Próximos partidos</h2>

      {isLoading ? (
        <p className="text-muted">Cargando partidos…</p>
      ) : matchesMapped.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matchesMapped}
        </div>
       ) : (
         <EmptyState
           title="No hay partidos disponibles"
           message="Todavía no se publicaron partidos. Volvé a pasar en unos días."
         />
       )}
       </section>

       <ClubStrip />
    </>
  )
}