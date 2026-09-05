import MatchCard from '../matchCard/MatchCard'
import { matchesMock } from '../../../data/matchesMock'

export default function MatchList() {
  return (
    <section>
      <h1 className="sr-only">Partidos</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {matchesMock.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  )
}