// Iconos en SVG inline, sin librería externa: son pocos y el proyecto
// ya resuelve así sus gráficos (EmptyState, CourtLines).
//
// Todos heredan el color del texto con currentColor y se dimensionan
// con la clase que les pase quien los use. aria-hidden porque son
// decorativos: el significado lo da el aria-label del botón.

interface IconProps {
  className?: string
}

const BASE_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
}

export function CheckCircleIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...BASE_PROPS} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </svg>
  )
}

export function FlagIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...BASE_PROPS} className={className}>
      <path d="M5 21V3" />
      <path d="M5 3h14l-2.5 4.5L19 12H5Z" />
    </svg>
  )
}

export function XCircleIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...BASE_PROPS} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </svg>
  )
}

export function UndoIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...BASE_PROPS} className={className}>
      <path d="M4 10h11a4 4 0 0 1 0 8h-6" />
      <path d="m8 6-4 4 4 4" />
    </svg>
  )
}

export function PencilIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...BASE_PROPS} className={className}>
      <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="m14.5 6.5 3 3" />
    </svg>
  )
}

export function TrashIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...BASE_PROPS} className={className}>
      <path d="M4 7h16" />
      <path d="M9 7V5h6v2" />
      <path d="M6 7v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

// Iconos del clima. Usan fill="none" y trazo como los demás, pero el sol
// lleva relleno para que se distinga de la luna a tamaño chico.

export function SunIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...BASE_PROPS} className={className}>
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
      <path d="m5 5 1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
    </svg>
  )
}

export function CloudIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...BASE_PROPS} className={className}>
      <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.5-1.5A3.5 3.5 0 0 1 17 18Z" />
    </svg>
  )
}

export function RainIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...BASE_PROPS} className={className}>
      <path d="M7 15a4 4 0 0 1 0-8 5 5 0 0 1 9.5-1.5A3.5 3.5 0 0 1 17 15Z" />
      <path d="M9 18v2M13 18v3M17 18v2" />
    </svg>
  )
}

export function StormIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...BASE_PROPS} className={className}>
      <path d="M7 14a4 4 0 0 1 0-8 5 5 0 0 1 9.5-1.5A3.5 3.5 0 0 1 17 14Z" />
      <path d="m13 16-3 4h4l-3 4" />
    </svg>
  )
}

export function SnowIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...BASE_PROPS} className={className}>
      <path d="M7 15a4 4 0 0 1 0-8 5 5 0 0 1 9.5-1.5A3.5 3.5 0 0 1 17 15Z" />
      <path d="M9 19h.01M13 19h.01M17 19h.01M11 21h.01M15 21h.01" />
    </svg>
  )
}