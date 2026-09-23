import { useEffect, useState } from 'react'

import ClubLogo from '../../shared/clubLogo/ClubLogo'
import { getClubs } from './ClubStrip.server'
import type { Club } from '../../../types/club'

export default function ClubStrip() {
  const [clubs, setClubs] = useState<Club[]>([])

  useEffect(() => {
    getClubs({
      onSuccess: setClubs,
      // Sin toast: la franja es decorativa. Si falla, simplemente
      // no se muestra y el resto de la home sigue funcionando.
      onError: () => setClubs([]),
    })
  }, [])

  // Nada que mostrar todavía: no dibujamos el contenedor vacío.
  if (clubs.length === 0) return null

  // La lista se renderiza DOS veces seguidas. La animación desplaza el
  // conjunto exactamente un 50%: al terminar, el segundo grupo queda
  // donde arrancó el primero, así que el reinicio es invisible y parece
  // un loop infinito. Sin esto se vería un salto en cada vuelta.
  const logos = [...clubs, ...clubs].map((club, index) => (
    <ClubLogo
      // El índice va en la key porque la lista está duplicada a propósito:
      // el id solo ya no sería único.
      key={`${club.id}-${index}`}
      name={club.name}
      logoUrl={club.logoUrl}
    />
  ))

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-2xl font-bold text-navy">Clubes participantes</h2>

      {/* overflow-hidden recorta lo que sale por los costados.
          group habilita el pause al pasar el mouse. */}
      <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white py-6">
        {/* aria-hidden: la franja es decorativa y los nombres de los
            clubes ya están en las tarjetas de partidos. */}
        <div className="animate-club-strip flex w-max gap-10" aria-hidden="true">
          {logos}
        </div>

        {/* Degradados en los bordes: los escudos se desvanecen en vez de
            cortarse de golpe contra el borde del contenedor. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  )
}