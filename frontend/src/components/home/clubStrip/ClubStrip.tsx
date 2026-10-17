import { useEffect, useState } from 'react'

import ClubLogo from '../../shared/clubLogo/ClubLogo'
import { getClubs } from './ClubStrip.server'
import type { Club } from '../../../types/club'

export default function ClubStrip() {
  const [clubs, setClubs] = useState<Club[]>([])

  useEffect(() => {
    getClubs({
      onSuccess: setClubs,
      onError: () => setClubs([]),
    })
  }, [])

  if (clubs.length === 0) return null

  const logos = [...clubs, ...clubs].map((club, index) => (
    <ClubLogo
      key={`${club.id}-${index}`}
      name={club.name}
      logoUrl={club.logoUrl}
    />
  ))

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-2xl font-bold text-navy">Clubes participantes</h2>

      <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white py-6">
        <div className="animate-club-strip flex w-max gap-10" aria-hidden="true">
          {logos}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  )
}