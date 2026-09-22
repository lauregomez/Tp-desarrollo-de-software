import { useState } from 'react'
import { getClubInitials } from './ClubLogo.data'

interface ClubLogoProps {
  name: string
  logoUrl: string | null
  // md: tarjetas de listado. lg: pantalla de detalle.
  size?: 'md' | 'lg'
}

// Clases completas por variante: Tailwind necesita el nombre literal
// en el código para generarlo.
const SIZE_CLASS: Record<NonNullable<ClubLogoProps['size']>, string> = {
  md: 'h-12 w-12 text-xs',
  lg: 'h-16 w-16 text-sm',
}

export default function ClubLogo({ name, logoUrl, size = 'md' }: ClubLogoProps) {
  // El escudo es una URL externa: si falla la carga mostramos las
  // iniciales en vez de la imagen rota del navegador. El estado vive
  // acá para que cada escudo falle por su cuenta (MatchCard muestra dos).
  const [logoFailed, setLogoFailed] = useState(false)

  if (logoUrl && !logoFailed) {
    // Sin rounded-full: muchos escudos no son circulares y el borde
    // redondeado les recorta las puntas.
    return (
      <img
        src={logoUrl}
        alt={`Escudo de ${name}`}
        onError={() => setLogoFailed(true)}
        className={`${SIZE_CLASS[size]} shrink-0 object-contain`}
      />
    )
  }

  return (
    <div
      className={`${SIZE_CLASS[size]} flex shrink-0 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-500`}
      aria-hidden="true"
    >
      {getClubInitials(name)}
    </div>
  )
}