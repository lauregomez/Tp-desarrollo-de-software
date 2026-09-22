import { useState } from 'react'
import { getClubInitials } from './ClubLogo.data'

interface ClubLogoProps {
  name: string
  logoUrl: string | null
}

export default function ClubLogo({ name, logoUrl }: ClubLogoProps) {
  // El escudo es una URL externa: si falla la carga mostramos las
  // iniciales en vez de la imagen rota del navegador. El estado vive
  // acá para que cada escudo falle por su cuenta (MatchCard muestra dos).
  const [logoFailed, setLogoFailed] = useState(false)

  if (logoUrl && !logoFailed) {
    return (
      <img
        src={logoUrl}
        alt={`Escudo de ${name}`}
        onError={() => setLogoFailed(true)}
        className="h-12 w-12 shrink-0 rounded-full object-contain"
      />
    )
  }

  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-500"
      aria-hidden="true"
    >
      {getClubInitials(name)}
    </div>
  )
}