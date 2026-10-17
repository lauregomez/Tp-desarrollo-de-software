import CourtLines from '../../shared/courtLines/CourtLines'

export default function Hero() {
  return (
    <section className="relative mb-8 overflow-hidden rounded-2xl bg-navy px-6 py-12 text-white md:px-12 md:py-16">
      <CourtLines className="absolute inset-0 h-full w-full text-white/10" />

      <div className="relative max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
          Asociación Rosarina de Fútsal
        </p>
        <h1 className="mt-2 text-3xl font-bold md:text-5xl">
          Viví el fútsal de Rosario
        </h1>
        <p className="mt-4 text-white/80 md:text-lg">
          Comprá tu entrada general online y entrá a la cancha con tu código de acceso.
        </p>
        <a
          href="#partidos"
          className="mt-8 inline-block rounded-lg bg-brand px-5 py-3 font-semibold text-white hover:brightness-110"
        >
          Ver próximos partidos
        </a>
      </div>
    </section>
  )
}