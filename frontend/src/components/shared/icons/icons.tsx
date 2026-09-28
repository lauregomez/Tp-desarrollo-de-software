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