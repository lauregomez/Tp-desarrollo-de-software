// Líneas de una cancha de fútsal (40 x 20 m) para usar de fondo decorativo.
// El viewBox es 400 x 200: 1 unidad = 10 cm, así cada medida del dibujo sale
// directo del reglamento (círculo central de 3 m, área de 6 m, etc.).
// Usa currentColor: el color se controla con la clase de texto del padre.
interface CourtLinesProps {
  className?: string
}

export default function CourtLines({ className = '' }: CourtLinesProps) {
  return (
    <svg
      viewBox="0 0 400 200"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      // Decorativo: los lectores de pantalla lo ignoran.
      aria-hidden="true"
      focusable="false"
      // slice: cubre todo el contenedor aunque sus proporciones no sean 2:1.
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      {/* Perímetro y línea de mitad de cancha */}
      <rect x="1" y="1" width="398" height="198" />
      <line x1="200" y1="1" x2="200" y2="199" />

      {/* Círculo central (radio 3 m) y punto central */}
      <circle cx="200" cy="100" r="30" />
      <circle cx="200" cy="100" r="2" fill="currentColor" />

      {/* Áreas: cuartos de círculo de 6 m desde cada palo, unidos por una recta */}
      <path d="M 0 25 A 60 60 0 0 1 60 85 L 60 115 A 60 60 0 0 1 0 175" />
      <path d="M 400 25 A 60 60 0 0 0 340 85 L 340 115 A 60 60 0 0 0 400 175" />

      {/* Puntos penales (6 m) y segundos puntos penales (10 m) */}
      <circle cx="60" cy="100" r="2" fill="currentColor" />
      <circle cx="100" cy="100" r="2" fill="currentColor" />
      <circle cx="340" cy="100" r="2" fill="currentColor" />
      <circle cx="300" cy="100" r="2" fill="currentColor" />

      {/* Arcos (3 m de ancho) */}
      <line x1="1" y1="85" x2="1" y2="115" strokeWidth={4} />
      <line x1="399" y1="85" x2="399" y2="115" strokeWidth={4} />
    </svg>
  )
}