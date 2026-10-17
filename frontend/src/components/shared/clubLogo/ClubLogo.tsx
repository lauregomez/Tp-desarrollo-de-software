import { useState } from 'react'
import { getClubInitials } from './ClubLogo.data'

interface ClubLogoProps {
  name: string
  logoUrl: string | null
  size?: 'md' | 'lg'
}

const SIZE_CLASS: Record<NonNullable<ClubLogoProps['size']>, string> = {
  md: 'h-12 w-12 text-xs',
  lg: 'h-16 w-16 text-sm',
}

export default function ClubLogo({ name, logoUrl, size = 'md' }: ClubLogoProps) {
  const [logoFailed, setLogoFailed] = useState(false)

  if (logoUrl && !logoFailed) {
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