import CourtLines from '../../shared/courtLines/CourtLines'

// Bloque de bienvenida de la home. Es presentación pura: no pide datos ni
// tiene estado, así MatchList sigue ocupándose sólo del listado.
export default function Hero() {
  return (
    <section className="relative mb-8 overflow-hidden rounded-2xl bg-navy px-6 py-12 text-white md:px-12 md:py-16">
      {/* Líneas de la cancha de fondo: absolutas para que no empujen el
          contenido, y casi transparentes para que no compitan con el texto. */}
      <CourtLines className="absolute inset-0 h-full w-full text-white/10" />

      {/* relative: queda por encima del SVG absoluto. */}
      <div className="relative max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
          Asociación Rosarina de Fútsal
        </p>
        <h1 className="mt-2 text-3xl font-bold md:text-5xl">
          Viví el fútsal de Rosario
        </h1>
        <p className="mt-4 text-white/80 md:text-lg">
          Comprá tu entrada general online y entrá a la cancha con tu código QR.
        </p>
        {/* Ancla a la lista de abajo: es un link, no un botón, porque
            lleva a otra parte de la página y no ejecuta una acción. */}
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