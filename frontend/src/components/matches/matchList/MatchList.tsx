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

  useEffect(() => {
    let ignore = false
    setIsLoading(true)

    getMatches(
      { ...filters, statuses: ['PUBLISHED'] },
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

  const hasFilters = Object.values(filters).some((value) => value !== undefined)

  const matchesMapped = matches.map((match) => (
    <MatchCard key={match.id} match={match} />
  ))

  return (
     <>
       <Hero />

       <section id="partidos" className="scroll-mt-6">
         <h2 className="mb-4 text-2xl font-bold text-navy">Próximos partidos</h2>

         <MatchFilters filters={filters} onChange={setFilters} />
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