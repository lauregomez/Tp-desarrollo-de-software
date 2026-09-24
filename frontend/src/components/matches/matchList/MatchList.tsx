import { useEffect, useState } from 'react'
import MatchCard from '../matchCard/MatchCard'
import { errorToast } from '../../../shared/notifications'
import { getMatches } from './MatchList.server'
import Hero from '../../home/hero/Hero'
import EmptyState from '../../shared/emptyState/EmptyState'
import MatchFilters from '../matchFilters/MatchFilters'
import type { PublicMatch, MatchFilterValues } from '../../../types/match'
import ClubStrip from '../../home/clubStrip/ClubStrip'

export default function MatchList() {
  const [matches, setMatches] = useState<PublicMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<MatchFilterValues>({})

  // Corre al montar y cada vez que cambia algún filtro.
  useEffect(() => {
    // Mismo resguardo que en Mis entradas: si el filtro cambia antes de que
    // llegue la respuesta, la vieja se descarta para no pisar a la nueva.
    let ignore = false
    setIsLoading(true)

    // status va fijo: en la pantalla pública solo se listan publicados,
    // por eso el usuario no elige estado.
    getMatches(
      { ...filters, status: 'PUBLISHED' },
      {
        onSuccess: (data) => {
          if (ignore) return
          setMatches(data)
          setIsLoading(false)
        },
        onError: (error) => {
          if (ignore) return
          errorToast(error.message)
          setIsLoading(false)
        },
      },
    )

    return () => {
      ignore = true
    }
  }, [filters])

  // Hay filtro activo si al menos uno tiene valor.
  const hasFilters = Object.values(filters).some((value) => value !== undefined)

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

         <MatchFilters filters={filters} onChange={setFilters} />
      {/* El texto de carga solo aparece la primera vez, cuando no hay nada
          que mostrar. Al cambiar un filtro, la lista anterior queda visible
          y atenuada hasta que llega la nueva: así no parpadea. */}
      {isLoading && matches.length === 0 ? (
        <p className="text-muted">Cargando partidos…</p>
      ) : matchesMapped.length > 0 ? (
        <div
          className={`grid grid-cols-1 gap-4 transition-opacity md:grid-cols-2 lg:grid-cols-3 ${
            isLoading ? 'opacity-50' : ''
          }`}
        >
          {matchesMapped}
        </div>
      ) : (
        <EmptyState
          title={hasFilters ? 'No hay partidos con esos filtros' : 'No hay partidos disponibles'}
          message={
            hasFilters
              ? 'Probá con otro club, otra cancha u otra búsqueda.'
              : 'Todavía no se publicaron partidos. Volvé a pasar en unos días.'
          }
        />
      )}
       </section>

       <ClubStrip />
    </>
  )
}